import React from "react";
import { Chart, LineSeries } from "lightweight-charts-react-components";

const data = [
  { time: "2026-06-02", value: 101 },
  { time: "2026-06-03", value: 104 },
  { time: "2026-06-04", value: 103 },
  { time: "2026-06-05", value: 108 },
];

const App = () => {
  return (
    <Chart options={{ width: 640, height: 320 }}>
      <LineSeries data={data} />
    </Chart>
  );
};

export { App };
