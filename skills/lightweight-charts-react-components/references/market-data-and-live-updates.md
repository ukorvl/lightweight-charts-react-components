# Market data and live updates

Use this for a quote screen or trading terminal that loads OHLC history and then
receives bar snapshots from a socket. The usual pains are duplicate timestamps,
milliseconds treated as seconds, stale candles after a refetch, and a chart that
keeps zooming out while the user reads history.

## Decide who owns the complete history

| Data flow                                                    | Implementation                                            | Reason                                                  |
| ------------------------------------------------------------ | --------------------------------------------------------- | ------------------------------------------------------- |
| Modest update rate; other React UI needs the history         | Full array in `data`, default `reactive`                  | One source of truth for the chart and application       |
| A snapshot, refetch, prepend, trim, or historical correction | Replace the full array; optionally `alwaysReplaceData`    | The chart must match the supplied history exactly       |
| Frequent ticks; chart does not need to render React per tick | `reactive={false}`, then `ref.current.api()?.update(bar)` | The chart owns ongoing updates; React owns its lifetime |

Reactive `data` always means the **entire desired dataset**. Passing `[latestBar]`
replaces history. The wrapper attempts `update()` only for a one-item append or a
same-time last-item replacement when all earlier item references match the
upstream API's current data. Other changes use `setData()`. Preserving references
allows the optimization; do not promise it for every upstream data representation.

`reactive={false}` still calls `setData(data)` during initialization. It ignores
subsequent data prop changes. Do not combine imperative ticks with a reactive
snapshot that can overwrite them.

## Normalize the feed at the boundary

This adapter expects **complete candle snapshots**, not individual trades. Build
OHLC aggregation upstream if the feed contains trade prices. `timestampMs` is the
bar-open instant in UTC milliseconds. A payload that revises the same bar appears
later in the response and wins. Invalid data is rejected rather than plotted.

```ts
import type { CandlestickData, UTCTimestamp } from "lightweight-charts";

export type Candle = CandlestickData<UTCTimestamp>;
export type WireCandle = {
  timestampMs: number;
  open: number | string;
  high: number | string;
  low: number | string;
  close: number | string;
};

export function normalizeCandle(row: WireCandle): Candle {
  const seconds = row.timestampMs / 1000;
  const prices = [row.open, row.high, row.low, row.close].map(value => {
    if (typeof value === "string" && value.trim() === "") {
      throw new Error("Empty OHLC price");
    }
    return Number(value);
  });
  const [open, high, low, close] = prices;
  if (
    !Number.isSafeInteger(seconds) ||
    !prices.every(Number.isFinite) ||
    low > Math.min(open, close) ||
    high < Math.max(open, close) ||
    low > high
  ) {
    throw new Error("Invalid candle snapshot");
  }
  // The brand expresses validated epoch seconds; it does not perform conversion.
  return { time: seconds as UTCTimestamp, open, high, low, close };
}

export function normalizeHistory(rows: WireCandle[]): Candle[] {
  const byTime = new Map<UTCTimestamp, Candle>();
  for (const row of rows) {
    const candle = normalizeCandle(row);
    byTime.set(candle.time, candle);
  }
  return [...byTime.values()].sort((a, b) => a.time - b.time);
}

export function upsertLatest(history: Candle[], bar: Candle): Candle[] {
  const last = history[history.length - 1];
  if (!last || bar.time > last.time) return [...history, bar];
  if (bar.time === last.time) return [...history.slice(0, -1), bar];
  // This tail-only path rejects late history. Reconcile corrections separately
  // into a complete snapshot, then replace data instead of appending them.
  return history;
}
```

Keep daily business dates as `YYYY-MM-DD` or `BusinessDay` when the source is a
calendar-day series. Do not convert those dates through the browser's local time
zone. An intraday feed should consistently use UTC seconds. Do not mix time
representations or infer seconds versus milliseconds from an arbitrary threshold.

## Recipe: React-owned live candles

Save the adapter above as `market-data.ts`, then this component as
`LiveCandles.tsx`. The subscription adapter delivers normalized complete candles
and returns an unsubscribe function. It must cover the snapshot-to-subscription
gap using the provider's cursor/replay protocol. It must also reject stale same-bar
revisions using the provider's sequence number when one exists; timestamp order
alone cannot order revisions of one candle.

```tsx
import { useEffect, useState } from "react";
import {
  CandlestickSeries,
  Chart,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import { upsertLatest, type Candle } from "./market-data";

export type SubscribeBars = (receive: (bar: Candle) => void) => () => void;

export function LiveCandles({
  initialData,
  subscribe,
}: {
  initialData: Candle[];
  subscribe: SubscribeBars;
}) {
  // Mount with a key containing symbol + interval + snapshot revision when the
  // dataset identity changes. initialData is intentionally a mount-time seed.
  const [data, setData] = useState<Candle[]>(() => initialData.map(bar => ({ ...bar })));

  useEffect(() => {
    let active = true;
    const unsubscribe = subscribe(bar => {
      if (active) setData(previous => upsertLatest(previous, { ...bar }));
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [subscribe]);

  return (
    <section style={{ minWidth: 0 }}>
      <Chart
        containerProps={{ style: { height: 360, width: "100%" } }}
        options={{
          autoSize: true,
          timeScale: { timeVisible: true, secondsVisible: false },
        }}
      >
        <CandlestickSeries data={data} />
        <TimeScale>
          {/* A stable trigger fits once. Every tick must preserve user zoom. */}
          <TimeScaleFitContentTrigger deps={[]} />
        </TimeScale>
      </Chart>
    </section>
  );
}
```

The wrapper itself defaults only `addDefaultPane` to `false`; it does **not**
enable `autoSize`. Set `autoSize: true` explicitly and give the wrapper a nonzero
height. Width can follow its parent. Flex/grid cards often need `minWidth: 0` on
the card to allow shrinking. Use `containerRef` for the DOM node and the chart
`ref` for its API wrapper; these are different references.

For a Next.js App Router integration, put `"use client"` at the top of the chart's
client module. If its surrounding setup still cannot prerender the chart, load
that module through a client-side dynamic boundary with `ssr: false`. Do not access
`window` or create chart APIs during server rendering. See the
[Next.js client-only loading guidance](https://nextjs.org/docs/app/guides/lazy-loading#skipping-ssr)
for placement of that boundary.

## Recipe: chart-owned ticks

Use this alternative when the chart must consume many snapshots without a React
render for each one. The subscription contract remains the same. The chart and
series refs expose wrapper objects: the native APIs are returned by `.api()`.
A non-null wrapper ref can still contain a null API until initialization finishes.

```tsx
import { useEffect, useRef, useState } from "react";
import type { IChartApi, Time } from "lightweight-charts";
import {
  CandlestickSeries,
  Chart,
  type ChartApiRef,
  type SeriesApiRef,
} from "lightweight-charts-react-components";
import type { Candle } from "./market-data";
import type { SubscribeBars } from "./LiveCandles";

export function ImperativeCandles({
  initialData,
  subscribe,
}: {
  initialData: Candle[];
  subscribe: SubscribeBars;
}) {
  const chartRef = useRef<ChartApiRef<Time, IChartApi>>(null);
  const seriesRef = useRef<SeriesApiRef<"Candlestick">>(null);
  // The seed stays stable; mount with a new key for another dataset identity.
  const [seed] = useState(() => initialData.map(bar => ({ ...bar })));

  useEffect(() => {
    let active = true;
    let frame = 0;
    let unsubscribe: (() => void) | undefined;
    let lastTime = seed[seed.length - 1]?.time;

    const startWhenReady = () => {
      if (!active) return;
      const chart = chartRef.current?.api();
      const series = seriesRef.current?.api();
      if (!chart || !series) {
        frame = requestAnimationFrame(startWhenReady);
        return;
      }
      // Fit after initialization, then leave the viewport to the user.
      chart.timeScale().fitContent();
      unsubscribe = subscribe(bar => {
        if (!active || (lastTime !== undefined && bar.time < lastTime)) return;
        series.update({ ...bar });
        lastTime = bar.time;
      });
    };
    startWhenReady();
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      unsubscribe?.();
    };
  }, [seed, subscribe]);

  return (
    <Chart
      ref={chartRef}
      options={{ autoSize: true, timeScale: { timeVisible: true } }}
      containerProps={{ style: { height: 360 } }}
    >
      <CandlestickSeries ref={seriesRef} data={seed} reactive={false} />
    </Chart>
  );
}
```

For explicit “Live” controls, call `chartRef.current?.api()?.timeScale().scrollToRealTime()`
from the control handler. `fitContent()` shows the entire dataset; it does not mean
“follow the last bar.” Upstream `shiftVisibleRangeOnNewBar` normally shifts only
when the last bar is visible. For controlled follow mode, turn automatic shifting
off and scroll after accepted updates only when follow mode is enabled.

## Failure modes and acceptance checks

- Rebuild the full snapshot when older bars are corrected. Tail-only examples
  deliberately ignore older updates; reconnect recovery must replace history.
- Pause drawing by stopping/buffering feed application if desired. Toggling
  `reactive` does not stop the socket or give an imperative chart a replay buffer.
- A trim or a batch append may call `setData()`; do not mutate earlier objects in
  place and expect the wrapper to detect that mutation.
- Cloning the complete dataset on every render (for example `data.map(...)` in
  JSX) changes every earlier reference and forces the `setData()` path. Copy at
  the boundary once and preserve earlier objects during tail updates.
- Confirm initial data is sorted and unique; a same-time update replaces exactly
  one bar; a later-time update adds one; an older-time update follows the chosen
  correction policy. Pan left, update, and verify the user's viewport remains.
- Change symbol/interval and verify the old subscription is disposed and no old
  bars enter the new chart. Check a narrow card and a client-rendered route for a
  nonzero canvas size.
