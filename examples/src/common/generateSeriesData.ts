import dayjs from "dayjs";
import { createStubArray } from "./utils";
import type { CandlestickData, LineData } from "lightweight-charts";

const generateLineData = (length: number): LineData[] => {
  const start = dayjs().subtract(length, "day");
  let lastValue = Math.floor(Math.random() * 100);

  return createStubArray(length).map((_, i) => {
    const change = Math.floor(Math.random() * 21) - 10;
    lastValue = Math.max(0, lastValue + change);

    return {
      time: start.add(i, "day").format("YYYY-MM-DD"),
      value: lastValue,
    };
  });
};

const generateOHLCData = (length: number): CandlestickData[] => {
  const start = dayjs().subtract(length, "day");
  let previousClose = Math.random() * 100;

  return createStubArray(length).map((_, i) => {
    const open = previousClose;
    const high = open + Math.random() * 10;
    const low = open - Math.random() * 10;
    const close = low + Math.random() * (high - low);

    previousClose = close;

    return {
      time: start.add(i, "day").format("YYYY-MM-DD"),
      open,
      high,
      low,
      close,
    };
  });
};

export { generateLineData, generateOHLCData };
