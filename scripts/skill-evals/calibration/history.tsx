// Hidden evaluator calibration, never copied into agent inputs.
import { useEffect, useRef, useState } from "react";
import {
  CandlestickSeries,
  Chart,
  Pane,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import type { ChartApiRef, SeriesApiRef } from "lightweight-charts-react-components";
import type { TaskProps } from "./scenario";
import type { CandlestickData, IChartApi, Time, UTCTimestamp } from "lightweight-charts";

const options = { autoSize: true };
function convert(rows: TaskProps["snapshot"]): CandlestickData<UTCTimestamp>[] {
  return rows.map(bar => ({
    time: (bar.timeMs / 1000) as UTCTimestamp,
    open: bar.open,
    high: bar.high,
    low: bar.low,
    close: bar.close,
  }));
}
export function Task(props: TaskProps) {
  // A symbol owns its history/request session; remounting rejects late completions.
  return <History key={props.symbol} {...props} />;
}
function History({ snapshot, symbol, loadBefore }: TaskProps) {
  const initial = useRef(convert(snapshot));
  const data = useRef(initial.current);
  const chart = useRef<ChartApiRef<Time, IChartApi>>(null);
  const series = useRef<SeriesApiRef<"Candlestick">>(null);
  const retry = useRef<() => void>(() => {});
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let frame = 0;
    let cancelled = false;
    let busy = false;
    let exhausted = false;
    let release = () => {};
    const start = () => {
      const api = chart.current?.api();
      const candles = series.current?.api();
      if (!api || !candles) {
        frame = requestAnimationFrame(start);
        return;
      }
      const load = async () => {
        if (busy || exhausted || cancelled) return;
        busy = true;
        setFailed(false);
        try {
          const result = await loadBefore(symbol, Number(data.current[0].time) * 1000);
          if (cancelled) return;
          if (!result.length) {
            exhausted = true;
            return;
          }
          const current = api.timeScale().getVisibleLogicalRange();
          const unique = new Map(
            convert(result)
              .filter(bar => bar.time < data.current[0].time)
              .map(bar => [bar.time, bar])
          );
          const older = [...unique.values()].sort(
            (a, b) => Number(a.time) - Number(b.time)
          );
          data.current = [...older, ...data.current];
          candles.setData(data.current);
          // Offset by distinct inserted slots, using the view when the response
          // finished rather than the view when the request began.
          if (current)
            api.timeScale().setVisibleLogicalRange({
              from: current.from + older.length,
              to: current.to + older.length,
            });
        } catch {
          if (!cancelled) setFailed(true);
        } finally {
          busy = false;
        }
      };
      const onRange = (visible: { from: number; to: number } | null) => {
        if (visible && visible.from < 5) void load();
      };
      retry.current = () => {
        void load();
      };
      api.timeScale().subscribeVisibleLogicalRangeChange(onRange);
      release = () => api.timeScale().unsubscribeVisibleLogicalRangeChange(onRange);
    };
    start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      release();
    };
  }, [symbol, loadBefore]);
  return (
    <>
      {failed && <button onClick={() => retry.current()}>Retry</button>}
      <Chart ref={chart} options={options} containerProps={{ style: { height: 480 } }}>
        <Pane>
          <CandlestickSeries ref={series} data={initial.current} reactive={false} />
        </Pane>
        <TimeScale>
          <TimeScaleFitContentTrigger deps={[]} />
        </TimeScale>
      </Chart>
    </>
  );
}
