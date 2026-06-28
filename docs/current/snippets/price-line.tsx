import React from "react";
import {
  Chart,
  LineSeries,
  PriceLine,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";

const data = [
  { time: "2026-06-02", value: 100 },
  { time: "2026-06-03", value: 102 },
  { time: "2026-06-04", value: 107 },
  { time: "2026-06-05", value: 105 },
];

const App = () => {
  return (
    <Chart options={{ width: 640, height: 320 }}>
      <LineSeries data={data}>
        <PriceLine
          price={104}
          options={{ color: "#ff9800", lineStyle: 2, title: "Alert level" }}
        />
      </LineSeries>
      <TimeScale>
        <TimeScaleFitContentTrigger deps={[]} />
      </TimeScale>
    </Chart>
  );
};

export { App };
