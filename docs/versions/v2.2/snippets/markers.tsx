import React from "react";
import { Chart, LineSeries, Markers } from "lightweight-charts-react-components";

const data = [
  { time: "2026-06-02", value: 100 },
  { time: "2026-06-03", value: 98 },
  { time: "2026-06-04", value: 104 },
  { time: "2026-06-05", value: 109 },
];

const markers = [
  {
    time: "2026-06-03",
    position: "belowBar" as const,
    color: "#2196f3",
    shape: "arrowUp" as const,
    text: "Buy",
  },
  {
    time: "2026-06-05",
    position: "aboveBar" as const,
    color: "#f44336",
    shape: "arrowDown" as const,
    text: "Take profit",
  },
];

const App = () => {
  return (
    <Chart options={{ width: 640, height: 320 }}>
      <LineSeries data={data}>
        <Markers markers={markers} />
      </LineSeries>
    </Chart>
  );
};

export { App };
