import { useCallback, useRef, useState } from "react";
import { makeCandles } from "./contracts";
import { Task } from "./Task";
import type { Candle } from "./contracts";

export type TaskProps = {
  snapshot: Candle[];
  subscribe: (listener: (bar: Candle) => void) => () => void;
  onDetails: (bar: Candle | null) => void;
};
const ordered = makeCandles(80);
const last = ordered[ordered.length - 1];
const snapshot = [
  ...ordered
    .slice()
    .reverse()
    .map((bar, index) => (index === 0 ? { ...bar, close: 102 } : bar)),
  { ...last, close: 103 },
];
const revision = { ...last, close: 105 };
const append = { ...last, timeMs: last.timeMs + 60000, close: 107 };
const stale = {
  ...last,
  timeMs: last.timeMs - 60000,
  open: 1000,
  high: 1001,
  low: 998,
  close: 999,
};

export function Scenario() {
  const [mounted, setMounted] = useState(true);
  const [details, setDetails] = useState<Candle | null>(null);
  const listeners = useRef(new Set<(bar: Candle) => void>());
  const onDetails = useCallback((bar: Candle | null) => {
    setDetails(previous =>
      JSON.stringify(previous) === JSON.stringify(bar) ? previous : bar
    );
  }, []);
  const subscribe = useCallback((listener: (bar: Candle) => void) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);
  const deliver = (bar: Candle) => {
    for (const listener of listeners.current) listener(bar);
  };
  return (
    <main style={{ width: 900 }}>
      <h1>Live candles</h1>
      <button onClick={() => deliver(revision)}>Revise current</button>
      <button onClick={() => deliver(append)}>Append candle</button>
      <button onClick={() => deliver(stale)}>Deliver stale</button>
      <button onClick={() => setMounted(value => !value)}>Toggle chart</button>
      <button
        onClick={() => {
          document.getElementById("subscriptions")!.textContent = String(
            listeners.current.size
          );
        }}
      >
        Inspect subscriptions
      </button>
      <output id="subscriptions" aria-label="Subscriptions" />
      <output aria-label="OHLC">{JSON.stringify(details)}</output>
      {mounted && (
        <Task snapshot={snapshot} subscribe={subscribe} onDetails={onDetails} />
      )}
    </main>
  );
}
