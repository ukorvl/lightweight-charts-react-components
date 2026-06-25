import {
  CandlestickSeries,
  Chart,
  Markers,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";

const App = () => {
  return (
    <Chart
      options={{
        width: 600,
        height: 400,
      }}
    >
      <CandlestickSeries data={data}>
        <Markers
          markers={[
            {
              time: data[2].time,
              position: "belowBar",
              color: "#26A69A",
              shape: "arrowUp",
              text: "Buy",
            },
            {
              time: data[5].time,
              position: "aboveBar",
              color: "#EF5350",
              shape: "arrowDown",
              text: "Sell",
            },
            {
              time: data[8].time,
              position: "inBar",
              color: "#FF9800",
              shape: "circle",
              text: "Note",
            },
          ]}
          options={{
            zOrder: "normal",
          }}
        />
      </CandlestickSeries>
      <TimeScale>
        <TimeScaleFitContentTrigger deps={[]} />
      </TimeScale>
    </Chart>
  );
};

const data = [
  { time: "2025-04-14", open: 80.4, high: 84.15, low: 78.45, close: 82.68 },
  { time: "2025-04-15", open: 82.68, high: 83.92, low: 79.36, close: 80.91 },
  { time: "2025-04-16", open: 80.91, high: 86.4, low: 80.2, close: 85.77 },
  { time: "2025-04-17", open: 85.77, high: 88.05, low: 84.62, close: 87.31 },
  { time: "2025-04-18", open: 87.31, high: 89.42, low: 85.88, close: 86.27 },
  { time: "2025-04-19", open: 86.27, high: 87.15, low: 81.94, close: 82.4 },
  { time: "2025-04-20", open: 82.4, high: 84.76, low: 80.71, close: 83.96 },
  { time: "2025-04-21", open: 83.96, high: 86.18, low: 82.52, close: 85.24 },
  { time: "2025-04-22", open: 85.24, high: 88.63, low: 84.77, close: 87.9 },
  { time: "2025-04-23", open: 87.9, high: 90.14, low: 86.88, close: 89.56 },
];

export { App };
