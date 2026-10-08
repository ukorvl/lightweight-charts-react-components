import { useCallback, useRef, useState } from "react";
import { epochMs, makeCandles } from "./contracts";
import { Task } from "./Task";
import type { Candle } from "./contracts";

export type TaskProps = {
  symbol: string;
  snapshot: Candle[];
  loadBefore: (
    symbol: string,
    beforeMs: number,
    signal?: AbortSignal
  ) => Promise<Candle[]>;
};
type Request = {
  symbol: string;
  beforeMs: number;
  resolve: (bars: Candle[]) => void;
  reject: (error: Error) => void;
};
const snapshots = {
  A: makeCandles(80),
  B: makeCandles(80, 100, epochMs + 86400000),
};
export function Scenario() {
  const [symbol, setSymbol] = useState<"A" | "B">("A");
  const [trace, setTrace] = useState<{ symbol: string; beforeMs: number }[]>([]);
  const requests = useRef<Request[]>([]);
  const loadBefore = useCallback((instrument: string, beforeMs: number) => {
    setTrace(previous => [...previous, { symbol: instrument, beforeMs }]);
    return new Promise<Candle[]>((resolve, reject) => {
      requests.current.push({ symbol: instrument, beforeMs, resolve, reject });
    });
  }, []);
  const resolve = (kind: "older" | "empty" | "fail") => {
    const request = requests.current.shift();
    if (!request) return;
    if (kind === "fail") {
      request.reject(new Error("Recoverable history failure"));
      return;
    }
    const offset = request.symbol === "A" ? 0 : 100;
    const bars =
      kind === "empty" ? [] : makeCandles(12, offset, request.beforeMs - 10 * 60000);
    request.resolve(bars);
  };
  return (
    <main style={{ width: 900 }}>
      <h1>History</h1>
      <button onClick={() => resolve("older")}>Resolve older</button>
      <button onClick={() => resolve("empty")}>Resolve empty</button>
      <button onClick={() => resolve("fail")}>Fail request</button>
      <button onClick={() => setSymbol(previous => (previous === "A" ? "B" : "A"))}>
        Switch symbol
      </button>
      <output aria-label="Requests">{JSON.stringify(trace)}</output>
      <output aria-label="Symbol">{symbol}</output>
      <Task symbol={symbol} snapshot={snapshots[symbol]} loadBefore={loadBefore} />
    </main>
  );
}
