import dayjs from "dayjs";
import { createStubArray } from "./utils";
import type { CandlestickData, HistogramData, LineData } from "lightweight-charts";

type GenerateHistogramDataOptions = {
  upColor?: string;
  downColor?: string;
};

type GenerateLineDataOptions = {
  lastItemTime?: string;
};

const generateLineData = (
  length: number,
  { lastItemTime }: GenerateLineDataOptions = {}
): LineData<string>[] => {
  const start = lastItemTime
    ? dayjs(lastItemTime).subtract(length, "day")
    : dayjs().subtract(length, "day");
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

const generateOHLCData = (length: number): CandlestickData<string>[] => {
  const start = dayjs().subtract(length, "day");
  let previousClose = Math.max(1, Math.random() * 100);

  return createStubArray(length).map((_, i) => {
    const open = previousClose;
    const high = open + Math.random() * 10;
    let low = open - Math.random() * 10;

    low = Math.max(0, low);

    const minimalDistance = 0.01;
    const adjustedHigh = Math.max(high, low + minimalDistance);

    const close = low + Math.random() * (adjustedHigh - low);

    previousClose = close;

    return {
      time: start.add(i, "day").format("YYYY-MM-DD"),
      open,
      high: adjustedHigh,
      low,
      close,
    };
  });
};

const generateHistogramData = (
  length: number,
  { upColor, downColor }: GenerateHistogramDataOptions = {}
): HistogramData<string>[] => {
  const lineData = generateLineData(length);

  return lineData.map((data, i) => {
    const isFirst = i === 0;
    const valueDecreased = !isFirst && data.value < lineData[i - 1].value;

    return {
      time: data.time,
      value: data.value,
      color: valueDecreased ? downColor : upColor,
    };
  });
};

export { generateLineData, generateOHLCData, generateHistogramData };
