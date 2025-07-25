import dayjs from "dayjs";
import { useEffect, useState } from "react";
import {
  CandlestickSeries,
  Chart,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import type { CandlestickData } from "lightweight-charts";

const App = () => {
  const [data, setData] = useState<CandlestickData[]>(candlestickSeriesData);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => {
        const lastDataPoint = prevData[prevData.length - 1];
        const newDataPoint = generateNextDataPoint(lastDataPoint);
        return [...prevData, newDataPoint];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Chart
        options={{
          width: 600,
          height: 400,
        }}
      >
        <CandlestickSeries data={data} />
        <TimeScale>
          <TimeScaleFitContentTrigger deps={[]} />
        </TimeScale>
      </Chart>
    </>
  );
};

const candlestickSeriesData = [
  { time: "2025-01-04", open: 80, high: 82.65, low: 76.67, close: 78.71 },
  { time: "2025-01-05", open: 78.71, high: 82.26, low: 75.37, close: 80.42 },
  { time: "2025-01-06", open: 80.42, high: 83.58, low: 80.16, close: 82.39 },
  { time: "2025-01-07", open: 82.39, high: 87.09, low: 79.75, close: 83.48 },
  { time: "2025-01-08", open: 83.48, high: 85.57, low: 82.5, close: 83.54 },
  { time: "2025-01-09", open: 83.54, high: 86.97, low: 83.3, close: 86.6 },
  { time: "2025-01-10", open: 86.6, high: 88.95, low: 86.37, close: 88.02 },
  { time: "2025-01-11", open: 88.02, high: 88.91, low: 85.93, close: 87.38 },
  { time: "2025-01-12", open: 87.38, high: 87.63, low: 84.52, close: 85.36 },
  { time: "2025-01-13", open: 85.36, high: 90.17, low: 84.21, close: 84.76 },
  { time: "2025-01-14", open: 84.76, high: 86.22, low: 83.51, close: 85.99 },
  { time: "2025-01-15", open: 85.99, high: 86.35, low: 83.83, close: 86.27 },
  { time: "2025-01-16", open: 86.27, high: 90.39, low: 83.85, close: 89.13 },
  { time: "2025-01-17", open: 89.13, high: 93.88, low: 88.65, close: 93.82 },
  { time: "2025-01-18", open: 93.82, high: 97.07, low: 91.0, close: 94.58 },
];

const generateNextDataPoint = (last: CandlestickData): CandlestickData => {
  const time = dayjs(last.time.toString()).add(1, "day").format("YYYY-MM-DD");

  const open = last.close;

  const volatility = (Math.random() * open) / 10 + 1;
  const direction = Math.random() > 0.5 ? 1 : -1;
  const change = volatility * direction;
  const minThreshold = 5;

  const close =
    open + change >= minThreshold
      ? open + change
      : open - change < -minThreshold
        ? open - change
        : open + change;

  const high = Math.max(open, close) + volatility / 2;
  const potentialLow = Math.min(open, close) - volatility / 2;
  const low = potentialLow >= minThreshold ? potentialLow : Math.max(open, close);

  return { time, open, high, low, close };
};

export { App };
