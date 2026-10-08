// Hidden evaluator calibration, never copied into agent inputs.
import { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  Chart,
  HistogramSeries,
  LineSeries,
  Pane,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import type { SeriesApiRef } from "lightweight-charts-react-components";
import type { TaskProps } from "./scenario";

const options = { autoSize: true };
const priceOptions = { priceScaleId: "right" };
const volumeOptions = {
  priceScaleId: "volume",
  priceLineVisible: false,
  lastValueVisible: false,
  priceFormat: { type: "volume" as const },
};
export function Task({ benchmark, price, volume, showVolume }: TaskProps) {
  const priceRef = useRef<SeriesApiRef<"Candlestick">>(null);
  const volumeRef = useRef<SeriesApiRef<"Histogram">>(null);
  useEffect(() => {
    let frame = 0;
    const configure = () => {
      const priceApi = priceRef.current?.api();
      const volumeApi = volumeRef.current?.api();
      if (!priceApi || !volumeApi) {
        frame = requestAnimationFrame(configure);
        return;
      }
      // Each series identifies its actual pane; chart.priceScale(id) defaults
      // to pane zero and can select the wrong overlay owner.
      priceApi.priceScale().applyOptions({ scaleMargins: { top: 0.05, bottom: 0.25 } });
      volumeApi.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
    };
    configure();
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <Chart options={options} containerProps={{ style: { height: 560 } }}>
      <Pane>
        <LineSeries data={benchmark} />
      </Pane>
      <Pane>
        <CandlestickSeries ref={priceRef} data={price} options={priceOptions} />
        <HistogramSeries
          ref={volumeRef}
          data={volume}
          options={{ ...volumeOptions, visible: showVolume }}
        />
      </Pane>
      <TimeScale>
        <TimeScaleFitContentTrigger deps={[]} />
      </TimeScale>
    </Chart>
  );
}
