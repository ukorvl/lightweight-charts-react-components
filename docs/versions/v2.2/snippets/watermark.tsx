import React from "react";
import {
  AreaSeries,
  Chart,
  Pane,
  WatermarkText,
} from "lightweight-charts-react-components";

const data = [
  { time: "2026-06-02", value: 101 },
  { time: "2026-06-03", value: 103 },
  { time: "2026-06-04", value: 107 },
  { time: "2026-06-05", value: 105 },
];

const App = () => {
  return (
    <Chart options={{ width: 640, height: 320 }}>
      <Pane>
        <AreaSeries data={data} />
        <WatermarkText
          visible
          text="Demo chart"
          color="rgba(33, 150, 243, 0.18)"
          fontSize={28}
        />
      </Pane>
    </Chart>
  );
};

export { App };
