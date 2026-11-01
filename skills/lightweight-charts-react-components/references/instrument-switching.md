# Instrument switching

Use this when a user selects a different symbol or interval, or switches between
preset viewing windows. Changing dataset identity should reset the view; choosing
a window should change only the visible range when the data is already loaded.

## Recipe: symbol or interval replacement with stale-response protection

Here the API returns a complete normalized OHLC snapshot. Copy this as a separate
module. A selection ID labels each response, and a chart is mounted only for the
matching result. This prevents showing the prior symbol under the new label and
gives the new dataset its own initial fit.

```tsx
import { useEffect, useState } from "react";
import type { CandlestickData, UTCTimestamp } from "lightweight-charts";
import {
  CandlestickSeries,
  Chart,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";

type Interval = "1h" | "1d";
type Selection = { symbol: string; interval: Interval };
type Snapshot = CandlestickData<UTCTimestamp>[];
type LoadSnapshot = (selection: Selection, signal: AbortSignal) => Promise<Snapshot>;

export function InstrumentHistory({ loadSnapshot }: { loadSnapshot: LoadSnapshot }) {
  const [selection, setSelection] = useState<Selection>({
    symbol: "ASSET_A",
    interval: "1d",
  });
  // The effect depends on these values: re-clicking the current interval creates a
  // new selection object but must not refetch or reset the view.
  const { symbol, interval } = selection;
  const id = `${symbol}:${interval}`;
  const [result, setResult] = useState<{ id: string; data: Snapshot } | null>(null);
  const [error, setError] = useState<{ id: string; message: string } | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setResult(null);
    setError(null);
    void loadSnapshot({ symbol, interval }, controller.signal).then(
      data => {
        if (active) setResult({ id, data });
      },
      cause => {
        if (active) {
          setError({
            id,
            message: cause instanceof Error ? cause.message : "Load failed",
          });
        }
      }
    );
    return () => {
      active = false;
      controller.abort();
    };
  }, [id, symbol, interval, loadSnapshot, retry]);

  const current = result?.id === id ? result : null;
  return (
    <section>
      <select
        aria-label="Instrument"
        value={selection.symbol}
        onChange={event =>
          setSelection(previous => ({ ...previous, symbol: event.target.value }))
        }
      >
        <option value="ASSET_A">Asset A</option>
        <option value="ASSET_B">Asset B</option>
      </select>
      <button onClick={() => setSelection(previous => ({ ...previous, interval: "1h" }))}>
        Hourly
      </button>
      <button onClick={() => setSelection(previous => ({ ...previous, interval: "1d" }))}>
        Daily
      </button>
      {error?.id === id ? (
        <button onClick={() => setRetry(value => value + 1)}>
          Retry: {error.message}
        </button>
      ) : !current ? (
        <p>Loading {id}…</p>
      ) : current.data.length === 0 ? (
        <p>No history for {id}</p>
      ) : (
        <Chart
          key={id}
          options={{
            autoSize: true,
            timeScale: { timeVisible: selection.interval === "1h" },
          }}
          containerProps={{ style: { height: 360 } }}
        >
          <CandlestickSeries data={current.data} alwaysReplaceData />
          <TimeScale>
            <TimeScaleFitContentTrigger deps={[]} />
          </TimeScale>
        </Chart>
      )}
    </section>
  );
}
```

Supply a stable `loadSnapshot` adapter. If a same-symbol refresh should preserve
zoom, keep the chart mounted, replace the full data array, and avoid a new fit
trigger. The recipe intentionally resets on selection because the data identity
and interval changed.

For a preset such as “last month” over already-loaded data, keep the series data
intact and call `timeScale.setVisibleRange({ from, to })` with matching time types,
or update `TimeScale`'s `visibleRange` prop after initialization. For “last 100
bars,” use logical bounds. Do not pass visible-range bounds and a fit trigger for
the same interaction: the fit trigger can overwrite the requested range.
Changing `timeVisible` formats an axis; it does not aggregate daily bars into
hourly bars. The data adapter must return the chosen granularity.

## Acceptance checks

- Select A, B, and a new interval rapidly. Return A's response last and verify
  that only the final selection renders. Cover empty snapshots and retry.
- Click the interval that is already selected: no request starts and the chart
  keeps its zoom and scroll position.
