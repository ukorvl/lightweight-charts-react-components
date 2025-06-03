import {
  CandlestickSeries,
  LineSeries,
  Chart,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";

const App = () => {
  return (
    <>
      <Chart
        options={{
          width: 600,
          height: 400,
        }}
      >
        <CandlestickSeries data={candlestickSeriesData} />
        <LineSeries isPane={true} data={lineSeriesData} />
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

const lineSeriesData = [
  { time: "2025-01-04", value: 8321 },
  { time: "2025-01-05", value: 6755 },
  { time: "2025-01-06", value: 1537 },
  { time: "2025-01-07", value: 9764 },
  { time: "2025-01-08", value: 3109 },
  { time: "2025-01-09", value: 5244 },
  { time: "2025-01-10", value: 276 },
  { time: "2025-01-11", value: 4089 },
  { time: "2025-01-12", value: 7812 },
  { time: "2025-01-13", value: 6137 },
  { time: "2025-01-14", value: 7894 },
  { time: "2025-01-15", value: 6137 },
  { time: "2025-01-16", value: 5678 },
  { time: "2025-01-17", value: 2341 },
  { time: "2025-01-18", value: 5643 },
];

export { App };
