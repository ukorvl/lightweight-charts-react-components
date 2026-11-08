# History and range selection

Use this when a user scrolls left to fetch older bars on one series. Adding history
should preserve the view. For several instruments on one chart, use
[multi-series history](multi-series-history.md) instead.

## Recipe: prepend older history without losing the viewed bars

This is a **single-series intraday chart**. `initialData` is a nonempty ascending,
unique array of UTC-second line points. `loadOlder(before, signal)` returns
normalized ascending points and an explicit `hasMore`. Its cursor is exclusive;
the recipe also discards overlap defensively. Mount with a new key for a new
dataset. The adapter owns transport, authentication, and response validation.

Use chart-owned data for this recipe so `setData()` runs outside React renders. Do not
restore a range captured when the request started: it would undo any panning the user
performs while waiting.

```tsx
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  IChartApi,
  LineData,
  LogicalRange,
  Time,
  UTCTimestamp,
} from "lightweight-charts";
import {
  Chart,
  LineSeries,
  TimeScale,
  type ChartApiRef,
  type SeriesApiRef,
} from "lightweight-charts-react-components";

type Point = LineData<UTCTimestamp>;
type HistoryPage = { data: Point[]; hasMore: boolean };
type LoadOlder = (before: UTCTimestamp, signal: AbortSignal) => Promise<HistoryPage>;

export function PaginatedHistory({
  initialData,
  loadOlder,
}: {
  initialData: Point[];
  loadOlder: LoadOlder;
}) {
  const [seed] = useState(() => initialData.map(point => ({ ...point })));
  const rows = useRef(seed);
  const chartRef = useRef<ChartApiRef<Time, IChartApi>>(null);
  const seriesRef = useRef<SeriesApiRef<"Line">>(null);
  const alive = useRef(false);
  const inFlight = useRef<AbortController | null>(null);
  const exhausted = useRef(false);
  const failed = useRef(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nearEdge = useCallback((range: LogicalRange | null) => {
    const bars = range && seriesRef.current?.api()?.barsInLogicalRange(range);
    return !!bars && bars.barsBefore < 20;
  }, []);

  const requestOlder = useCallback(async () => {
    const series = seriesRef.current?.api();
    const scale = chartRef.current?.api()?.timeScale();
    if (!alive.current || !series || !scale || !rows.current[0]) return;
    if (inFlight.current || exhausted.current || failed.current) return;

    // A ref locks synchronously; React loading state alone allows duplicate
    // requests when several range events arrive before a render.
    const controller = new AbortController();
    inFlight.current = controller;
    setLoading(true);
    setError(null);
    try {
      do {
        const first = rows.current[0];
        const page = await loadOlder(first.time, controller.signal);
        if (!alive.current || controller.signal.aborted) return;

        const byTime = new Map<UTCTimestamp, Point>();
        for (const point of page.data) {
          if (point.time < first.time) byTime.set(point.time, { ...point });
        }
        const older = [...byTime.values()].sort((a, b) => a.time - b.time);
        if (older.length === 0 && page.hasMore) {
          throw new Error("History cursor made no progress");
        }

        if (older.length > 0) {
          // The scale's offsets count from the last bar, so prepending keeps the
          // same bars and zoom width in view without translating the range.
          rows.current = [...older, ...rows.current];
          series.setData(rows.current);
        }
        exhausted.current = !page.hasMore;
        // Range events fired by this update hit the lock and are lost. A short page
        // can leave the edge in reach with no further event, so recheck it here.
      } while (!exhausted.current && nearEdge(scale.getVisibleLogicalRange()));
    } catch (cause) {
      if (alive.current && !controller.signal.aborted) {
        // Stop event-driven retries after a failure. Let the user retry once
        // instead of turning a drag into a loop of failed network requests.
        failed.current = true;
        setError(cause instanceof Error ? cause.message : "History load failed");
      }
    } finally {
      if (inFlight.current === controller) inFlight.current = null;
      if (alive.current) setLoading(false);
    }
  }, [loadOlder, nearEdge]);

  const onRange = useCallback(
    (range: LogicalRange | null) => {
      if (nearEdge(range)) void requestOlder();
    },
    [nearEdge, requestOlder]
  );

  useEffect(() => {
    alive.current = true;
    let frame = 0;
    const initializeView = () => {
      const series = seriesRef.current?.api();
      const scale = chartRef.current?.api()?.timeScale();
      if (!series || !scale) {
        frame = requestAnimationFrame(initializeView);
        return;
      }
      // Start near the tail. No fit trigger runs after a page is prepended.
      scale.setVisibleLogicalRange({
        from: Math.max(0, seed.length - 80),
        to: seed.length - 1 + 5,
      });
      onRange(scale.getVisibleLogicalRange());
    };
    initializeView();
    return () => {
      alive.current = false;
      cancelAnimationFrame(frame);
      inFlight.current?.abort();
    };
  }, [seed, onRange]);

  return (
    <section>
      <p>{loading ? "Loading older history…" : "Scroll left for older history"}</p>
      {error && (
        <button
          onClick={() => {
            failed.current = false;
            void requestOlder();
          }}
        >
          Retry: {error}
        </button>
      )}
      <Chart
        ref={chartRef}
        options={{ autoSize: true, timeScale: { timeVisible: true } }}
        containerProps={{ style: { height: 360 } }}
      >
        <LineSeries ref={seriesRef} data={seed} reactive={false} />
        <TimeScale onVisibleLogicalRangeChange={onRange} />
      </Chart>
    </section>
  );
}
```

Keep `loadOlder` stable for one dataset. Changing it restarts the view initialization
effect; changing the dataset should instead remount with a new key. The cancellation
check protects against transports that resolve even after abort.

`barsBefore` counts this one series' bars. With several series, logical indices
refer to their **union of times**, so test the edge with `range.from` on the shared
scale; the result then does not depend on which series is hidden.
If a live feed also owns the tail, merge against the current history at response
time and apply updates through the same data owner; do not let the captured request
snapshot overwrite newer ticks.

## Acceptance checks

- Drag left rapidly: one request is in flight, overlapping timestamps are not
  duplicated, and the bars visible at response time stay visible after prepend.
- Pan again before the response arrives; the eventual response preserves that
  later view. Keep scrolling until `hasMore` is false; requests stop.
- Simulate an error: the chart remains usable and retry is explicit. Unmount
  while fetching: no response updates a removed chart.
- Return pages shorter than the 20-bar threshold: loading continues without user
  movement until the edge is out of reach.

To move the chart in an automated browser test, send a horizontal wheel event to the
pane; it is the simplest input that works. For a drag, send `mousedown` to the pane's
top canvas, then several `mousemove` events to `document.documentElement`.
