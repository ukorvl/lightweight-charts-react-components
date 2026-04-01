import { useCallback, useRef, useState } from "react";
import {
  CandlestickSeries,
  Chart,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import type { SeriesApiRef } from "lightweight-charts-react-components";
import type {
  CandlestickData,
  MouseEventParams,
  Time,
  WhitespaceData,
} from "lightweight-charts";

type LegendData = {
  time: string;
  open: string;
  high: string;
  low: string;
  close: string;
};

const isCandlestickData = (
  data: CandlestickData<Time> | WhitespaceData<Time> | undefined
): data is CandlestickData<Time> => {
  return !!data && "open" in data && "high" in data && "low" in data && "close" in data;
};

const formatTime = (time: Time): string => {
  if (typeof time === "string") {
    return time;
  }

  if (typeof time === "number") {
    return new Date(time * 1000).toISOString().slice(0, 10);
  }

  return `${time.year}-${String(time.month).padStart(2, "0")}-${String(time.day).padStart(2, "0")}`;
};

const mapLegendData = (bar: CandlestickData<Time>): LegendData => {
  return {
    time: formatTime(bar.time),
    open: bar.open.toFixed(2),
    high: bar.high.toFixed(2),
    low: bar.low.toFixed(2),
    close: bar.close.toFixed(2),
  };
};

const data: CandlestickData[] = [
  { time: "2025-01-04", open: 80.0, high: 82.65, low: 76.67, close: 78.71 },
  { time: "2025-01-05", open: 78.71, high: 82.26, low: 75.37, close: 80.42 },
  { time: "2025-01-06", open: 80.42, high: 83.58, low: 80.16, close: 82.39 },
  { time: "2025-01-07", open: 82.39, high: 87.09, low: 79.75, close: 83.48 },
  { time: "2025-01-08", open: 83.48, high: 85.57, low: 82.5, close: 83.54 },
  { time: "2025-01-09", open: 83.54, high: 86.97, low: 83.3, close: 86.6 },
  { time: "2025-01-10", open: 86.6, high: 88.95, low: 86.37, close: 88.02 },
  { time: "2025-01-11", open: 88.02, high: 88.91, low: 85.93, close: 87.38 },
  { time: "2025-01-12", open: 87.38, high: 87.63, low: 84.52, close: 85.36 },
  { time: "2025-01-13", open: 85.36, high: 90.17, low: 84.21, close: 84.76 },
];

const App = () => {
  const seriesRef = useRef<SeriesApiRef<"Candlestick">>(null);
  const [legendData, setLegendData] = useState<LegendData>(() =>
    mapLegendData(data[data.length - 1])
  );

  const onCrosshairMove = useCallback((param: MouseEventParams) => {
    const seriesApi = seriesRef.current?.api();

    if (!seriesApi) {
      return;
    }

    if (!param.time) {
      setLegendData(mapLegendData(data[data.length - 1]));
      return;
    }

    const hoveredData = param.seriesData.get(seriesApi) as
      | CandlestickData<Time>
      | WhitespaceData<Time>
      | undefined;

    if (!isCandlestickData(hoveredData)) {
      return;
    }

    setLegendData(mapLegendData(hoveredData));
  }, []);

  return (
    <>
      <Chart
        options={{
          width: 600,
          height: 400,
        }}
        onCrosshairMove={onCrosshairMove}
      >
        <CandlestickSeries ref={seriesRef} data={data} />
        <TimeScale>
          <TimeScaleFitContentTrigger deps={[]} />
        </TimeScale>
      </Chart>
      <p>Time: {legendData.time}</p>
      <p>
        O: {legendData.open} H: {legendData.high} L: {legendData.low} C:{" "}
        {legendData.close}
      </p>
    </>
  );
};

export { App };
