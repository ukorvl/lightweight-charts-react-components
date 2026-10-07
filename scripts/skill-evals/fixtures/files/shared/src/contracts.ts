export type Candle = {
  timeMs: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export const epochMs = 1700000000000;
export function makeCandles(count: number, offset = 0, startMs = epochMs): Candle[] {
  return Array.from({ length: count }, (_, index) => ({
    timeMs: startMs + index * 60000,
    open: 100 + offset + index / 100,
    high: 110 + offset,
    low: 90 + offset,
    close: index === count - 1 ? 103 + offset : 101 + offset + index / 100,
  }));
}
