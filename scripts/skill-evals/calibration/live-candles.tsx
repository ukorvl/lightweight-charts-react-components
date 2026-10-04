// Hidden evaluator calibration, never copied into agent inputs.
import { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  Chart,
  Pane,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import type { ChartApiRef, SeriesApiRef } from "lightweight-charts-react-components";
import type { Candle } from "./contracts";
import type { TaskProps } from "./scenario";
import type { CandlestickData, IChartApi, Time, UTCTimestamp } from "lightweight-charts";

const options = { autoSize: true };
function normalize(rows: Candle[]): CandlestickData<UTCTimestamp>[] {
  const map = new Map(rows.map(bar => [bar.timeMs, bar]));
  return [...map.values()]
    .sort((a, b) => a.timeMs - b.timeMs)
    .map(bar => ({
      time: (bar.timeMs / 1000) as UTCTimestamp,
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
    }));
}
export function Task({ snapshot, subscribe, onDetails }: TaskProps) {
  const initial = useRef(normalize(snapshot));
  const data = useRef(initial.current);
  const selected = useRef<number | null>(null);
  const chart = useRef<ChartApiRef<Time, IChartApi>>(null);
  const series = useRef<SeriesApiRef<"Candlestick">>(null);
  useEffect(() => {
    let frame = 0;
    let stopped = false;
    let release: () => void = () => {};
    const announce = () => {
      const detailData = data.current;
      const bar =
        selected.current === null
          ? detailData.at(-1)
          : detailData.find(value => value.time === selected.current);
      onDetails(bar ? { ...bar, timeMs: Number(bar.time) * 1000 } : null);
    };
    const start = () => {
      const api = chart.current?.api();
      const candles = series.current?.api();
      if (!api || !candles) {
        frame = requestAnimationFrame(start);
        return;
      }
      const hover = (
        event: Parameters<IChartApi["subscribeCrosshairMove"]>[0] extends (
          parameter: infer P
        ) => void
          ? P
          : never
      ) => {
        selected.current = typeof event.time === "number" ? event.time : null;
        announce();
      };
      api.subscribeCrosshairMove(hover);
      const unsubscribe = subscribe(bar => {
        if (stopped) return;
        const point = normalize([bar])[0];
        const last = data.current.at(-1);
        if (last && point.time < last.time) return;
        // This imperative owner sends one native update and retains the full
        // dataset for details. A same-time point replaces rather than appends.
        data.current =
          last && point.time === last.time
            ? [...data.current.slice(0, -1), point]
            : [...data.current, point];
        candles.update(point);
        announce();
      });
      release = () => {
        unsubscribe();
        api.unsubscribeCrosshairMove(hover);
      };
      announce();
    };
    start();
    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      release();
    };
  }, [subscribe, onDetails]);
  return (
    <Chart ref={chart} options={options} containerProps={{ style: { height: 480 } }}>
      <Pane>
        <CandlestickSeries ref={series} data={initial.current} reactive={false} />
      </Pane>
      <TimeScale>
        <TimeScaleFitContentTrigger deps={[]} />
      </TimeScale>
    </Chart>
  );
}
