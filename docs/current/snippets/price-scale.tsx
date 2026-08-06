import React from "react";
import {
  Chart,
  LineSeries,
  Pane,
  PriceScale,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";

const data = [
  { time: "2026-06-02", value: 101 },
  { time: "2026-06-03", value: 104 },
  { time: "2026-06-04", value: 103 },
  { time: "2026-06-05", value: 108 },
];

const App = () => {
  return (
    <Chart options={{ width: 640, height: 320 }}>
      <Pane>
        <LineSeries data={data} />
        <PriceScale id="left" options={{ visible: true, borderVisible: false }} />
      </Pane>
      <TimeScale>
        <TimeScaleFitContentTrigger deps={[]} />
      </TimeScale>
    </Chart>
  );
};

export { App };
