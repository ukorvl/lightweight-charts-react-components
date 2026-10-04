import { useState } from "react";
import { epochMs, makeCandles } from "./contracts";
import { Task } from "./Task";
import type {
  CandlestickData,
  HistogramData,
  LineData,
  UTCTimestamp,
} from "lightweight-charts";

export type TaskProps = {
  benchmark: LineData<UTCTimestamp>[];
  price: CandlestickData<UTCTimestamp>[];
  volume: HistogramData<UTCTimestamp>[];
  showVolume: boolean;
};
const price = makeCandles(80).map(bar => ({
  time: (bar.timeMs / 1000) as UTCTimestamp,
  open: bar.open,
  high: bar.high,
  low: bar.low,
  close: bar.close,
}));
const benchmark = price.map(bar => ({ time: bar.time, value: 1000 + bar.close }));
const volume = price.map((bar, index) => ({
  time: bar.time,
  value: 1000000 + index * 1000,
}));
export function Scenario() {
  const [showVolume, setShowVolume] = useState(true);
  const [multiplier, setMultiplier] = useState(1);
  return (
    <main style={{ width: 900 }}>
      <h1>Volume overlay</h1>
      <button onClick={() => setShowVolume(value => !value)}>Toggle volume</button>
      <button onClick={() => setMultiplier(value => (value === 1 ? 100 : 1))}>
        Multiply volume
      </button>
      <output aria-label="Volume multiplier">{multiplier}</output>
      <Task
        benchmark={benchmark}
        price={price}
        volume={volume.map(bar => ({ ...bar, value: bar.value * multiplier }))}
        showVolume={showVolume}
      />
      <small>UTC grid starts at {epochMs / 1000}</small>
    </main>
  );
}
