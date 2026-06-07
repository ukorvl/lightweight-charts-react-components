import React from "react";
import {
  Chart,
  LineSeries,
  Pane,
  PanePrimitive,
} from "lightweight-charts-react-components";
import type { IPanePrimitive, Time } from "lightweight-charts";

const data = [
  { time: "2026-06-02", value: 101 },
  { time: "2026-06-03", value: 104 },
  { time: "2026-06-04", value: 103 },
  { time: "2026-06-05", value: 108 },
];

class NoopPanePrimitive implements IPanePrimitive<Time> {
  paneViews() {
    return [];
  }
}

const App = () => {
  return (
    <Chart options={{ width: 640, height: 320 }}>
      <Pane>
        <LineSeries data={data} />
        <PanePrimitive render={() => new NoopPanePrimitive()} />
      </Pane>
    </Chart>
  );
};

export { App };
