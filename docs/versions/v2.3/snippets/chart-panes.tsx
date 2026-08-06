import React from "react";
import {
  CandlestickSeries,
  Chart,
  HistogramSeries,
  Pane,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";

const ohlcData = [
  { time: "2026-06-02", open: 101, high: 106, low: 99, close: 104 },
  { time: "2026-06-03", open: 104, high: 109, low: 102, close: 108 },
  { time: "2026-06-04", open: 108, high: 110, low: 105, close: 106 },
];

const volumeData = [
  { time: "2026-06-02", value: 1200, color: "rgba(33, 150, 243, 0.45)" },
  { time: "2026-06-03", value: 1800, color: "rgba(33, 150, 243, 0.45)" },
  { time: "2026-06-04", value: 1600, color: "rgba(255, 152, 0, 0.45)" },
];

const App = () => {
  return (
    <Chart options={{ width: 720, height: 420 }}>
      <Pane stretchFactor={3}>
        <CandlestickSeries data={ohlcData} />
      </Pane>
      <Pane stretchFactor={1}>
        <HistogramSeries
          data={volumeData}
          options={{ priceFormat: { type: "volume" }, priceLineVisible: false }}
        />
      </Pane>
      <TimeScale>
        <TimeScaleFitContentTrigger deps={[]} />
      </TimeScale>
    </Chart>
  );
};

export { App };
