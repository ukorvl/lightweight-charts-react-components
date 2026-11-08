# Multi-series history

Use this alone when several instruments share a chart, older history loads on scroll,
and a tooltip shows price and return. `loadWindow` returns one instrument's ascending,
unique, positive quotes in `[from, to)`; `hasMore` is false once nothing is older than
`from`. Remount with a new key to change any prop except `hidden`.

- **One time window, one cursor.** Paging by bar count desynchronizes 7-day and 5-day
  calendars. The cursor moves only after every response succeeds, so a retry cannot
  duplicate or skip dates. Finished instruments leave the request list.
- **`range.from`, not `barsBefore`.** Logical indices cover the union of all times,
  hidden series included, while `barsBefore` counts one series' bars.
- **A loop.** Range events during a load hit the lock, and an empty window fires none.
- **Fixed baseline.** Chosen once across all instruments; older quotes plot against it.

```tsx
import { createRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { IChartApi, MouseEventParams, Time, UTCTimestamp } from "lightweight-charts";
import { Chart, LineSeries, TimeScale } from "lightweight-charts-react-components";
import type { ChartApiRef, SeriesApiRef } from "lightweight-charts-react-components";

type Sec = UTCTimestamp;
type Quote = { time: Sec; price: number };
type Page = { data: Quote[]; hasMore: boolean };
export type LoadPage = (id: string, from: Sec, to: Sec, s: AbortSignal) => Promise<Page>;
export type Asset = { id: string; label: string; color: string };
type Span = { end: Sec; windowSeconds: number };
type Props = Span & { instruments: Asset[]; hidden: Set<string>; loadWindow: LoadPage };
type Hover = { time: number; frame: Record<string, number>; param: MouseEventParams };

const box = { position: "absolute", pointerEvents: "none", overflow: "hidden" } as const;
const skin = { lineHeight: "20px", zIndex: 2, background: "white" };
const percent = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
const priceFormat = { type: "custom" as const, minMove: 0.01, formatter: percent };

// Keep the hovered point visible: flip across the cursor, then clamp to the chart.
const place = (cursor: number, size: number, limit: number) => {
  const spot = cursor + 12 + size <= limit ? cursor + 12 : cursor - 12 - size;
  return Math.max(0, Math.min(spot, limit - size));
};

export function MultiSeriesHistory(props: Props) {
  const { instruments, hidden, loadWindow, end, windowSeconds } = props;
  const chartRef = useRef<ChartApiRef<Time, IChartApi>>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [lines] = useState(
    () => new Map(instruments.map(({ id }) => [id, createRef<SeriesApiRef<"Line">>()]))
  );
  const [state] = useState(() => ({
    cursor: end,
    active: new Set(instruments.map(({ id }) => id)),
    quotes: new Map<string, Quote[]>(instruments.map(({ id }) => [id, []])),
    baseTime: undefined as number | undefined,
  }));
  const lock = useRef<AbortController | null>(null);
  const [hover, setHover] = useState<Hover | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadToEdge = useCallback(async () => {
    if (lock.current) return;
    lock.current = new AbortController();
    const { signal } = lock.current;
    try {
      while (state.active.size > 0) {
        const scale = chartRef.current?.api()?.timeScale();
        const range = scale?.getVisibleLogicalRange();
        if (state.baseTime !== undefined && (!range || range.from >= 20)) break;
        const to = state.cursor;
        const from = (to - windowSeconds) as Sec;
        const ids = [...state.active];
        const pages = await Promise.all(ids.map(id => loadWindow(id, from, to, signal)));
        if (signal.aborted) return;
        pages.forEach(({ data, hasMore }, index) => {
          const older = data.filter(({ time }) => time >= from && time < to);
          const known = state.quotes.get(ids[index]) ?? [];
          state.quotes.set(ids[index], [...older, ...known]);
          if (!hasMore) state.active.delete(ids[index]);
        });
        state.cursor = from;
        const lists = [...state.quotes.values()];
        const sets = lists.map(list => new Set(list.map(quote => quote.time)));
        state.baseTime ??= lists[0].find(q => sets.every(set => set.has(q.time)))?.time;
        if (state.baseTime === undefined) {
          // A finished instrument has nothing older, so no common time can still appear.
          if (state.active.size < instruments.length) state.active.clear();
          continue;
        }
        // A later series that only fills in times makes the scale shift, so restore it.
        const offset = scale?.scrollPosition() ?? 0;
        for (const [id, list] of state.quotes) {
          const base = list.find(quote => quote.time === state.baseTime)?.price ?? NaN;
          const rows = list.map(({ time, price }) => ({
            time,
            value: (price / base - 1) * 100,
            customValues: { price }, // Returns in param.seriesData for the tooltip.
          }));
          lines.get(id)?.current?.api()?.setData(rows);
        }
        scale?.scrollToPosition(offset, false);
        // That applies on the next frame, and scrollPosition is stale until then.
        await new Promise(requestAnimationFrame);
        if (signal.aborted) return;
      }
      if (state.baseTime === undefined) setError("No common observation");
      lock.current = null;
    } catch (cause) {
      // The lock stays on: retry is explicit, so a drag cannot loop failed requests.
      if (!signal.aborted) setError(String(cause));
    }
  }, [instruments, lines, loadWindow, state, windowSeconds]);

  useEffect(() => {
    let frame = 0;
    const start = () => {
      if (chartRef.current?.api()) void loadToEdge();
      else frame = requestAnimationFrame(start);
    };
    start();
    return () => {
      cancelAnimationFrame(frame);
      lock.current?.abort();
      lock.current = null;
    };
  }, [loadToEdge]);
  const onCrosshairMove = useCallback(
    (param: MouseEventParams) => {
      const { point, time } = param;
      const chartBox = containerRef.current;
      if (!chartBox || !point || typeof time !== "number") return setHover(null);
      const { clientWidth, clientHeight } = chartBox;
      const width = Math.min(200, clientWidth);
      const height = Math.min(20 * (instruments.length + 1), clientHeight);
      const left = place(point.x, width, clientWidth);
      const top = place(point.y, height, clientHeight);
      // Keep the latest event: setData fires per series, so earlier ones can be partial.
      setHover({ time, frame: { left, top, width, height }, param });
    },
    [instruments]
  );
  // Hover renders reuse this element, so no new options reach applyOptions.
  const chart = useMemo(
    () => (
      <Chart
        ref={chartRef}
        containerRef={containerRef}
        options={{ autoSize: true }}
        containerProps={{ style: { height: 360 } }}
        onCrosshairMove={onCrosshairMove}
      >
        {instruments.map(({ id, color }) => (
          <LineSeries
            key={id}
            ref={lines.get(id)}
            data={[]}
            reactive={false}
            options={{ color, visible: !hidden.has(id), priceFormat }}
          />
        ))}
        <TimeScale onVisibleLogicalRangeChange={() => void loadToEdge()} />
      </Chart>
    ),
    [hidden, instruments, lines, loadToEdge, onCrosshairMove]
  );
  const retry = () => {
    lock.current = null;
    setError(null);
    void loadToEdge();
  };
  const readout = (id: string, param: MouseEventParams) => {
    const api = lines.get(id)?.current?.api();
    const item = api && param.seriesData.get(api);
    const price = item?.customValues?.price;
    if (!item || !("value" in item) || typeof price !== "number") return "—";
    return `${price.toFixed(2)} (${percent(item.value)})`;
  };
  return (
    <section style={{ position: "relative" }}>
      {chart}
      {hover && (
        <div style={{ ...box, ...skin, ...hover.frame }}>
          <div>{new Date(hover.time * 1000).toISOString().slice(0, 10)}</div>
          {instruments
            .filter(({ id }) => !hidden.has(id))
            .map(({ id, label }) => (
              <div key={id}>{`${label}: ${readout(id, hover.param)}`}</div>
            ))}
        </div>
      )}
      {error && <button onClick={retry}>Retry: {error}</button>}
    </section>
  );
}
```

## Acceptance checks

- Three calendars with different start dates: no duplicate or missing dates; requests stop.
- With a 5-day series first or any hidden, the view holds. No common date: loading stops.
- At every edge, on a narrow chart, and with many instruments, the tooltip fits.
- Hover during a load and after a failure: rows fill in and the tooltip stays by the cursor.
