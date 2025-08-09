import dayjs from "dayjs";
import { getTimeFrameDigit, mapTimeFrameToDayjsUnit, type TimeFrame } from "./timeFrame";
import { createStubArray } from "./utils";
import type { ManipulateType } from "dayjs";
import type { CandlestickData, HistogramData, LineData, Time } from "lightweight-charts";

type GenerateDataCommonOptions = {
  /** @default 1d */
  timeFrame?: TimeFrame;
  /** @default "YYYY-MM-DD" */
  format?: string;
  /** @default true */
  shouldFormat?: boolean;
};

type GenerateHistogramDataOptions = {
  upColor?: string;
  downColor?: string;
} & GenerateDataCommonOptions;

type GenerateLineDataOptions = {
  lastItemTime?: string;
} & GenerateDataCommonOptions;

const getObjectToSubtract = (
  timeFrame: TimeFrame,
  length: number
): [number, ManipulateType] => {
  const unit = mapTimeFrameToDayjsUnit(timeFrame);

  return [getTimeFrameDigit(timeFrame) * length, unit];
};

const getObjectToAdd = (timeFrame: TimeFrame, i: number): [number, ManipulateType] => {
  const unit = mapTimeFrameToDayjsUnit(timeFrame);

  return [getTimeFrameDigit(timeFrame) * i, unit];
};

const generateLineData = <T extends Time = string>(
  length: number,
  {
    lastItemTime,
    timeFrame = "1d",
    format = "YYYY-MM-DD",
    shouldFormat = true,
  }: GenerateLineDataOptions = {}
): LineData<T>[] => {
  const subtract = getObjectToSubtract(timeFrame, length);

  const start = lastItemTime
    ? dayjs(lastItemTime).subtract(...subtract)
    : dayjs().subtract(...subtract);
  let lastValue = Math.floor(Math.random() * 100);

  return createStubArray(length).map((_, i) => {
    const change = Math.floor(Math.random() * 21) - 10;
    lastValue = Math.max(0, lastValue + change);
    const add = getObjectToAdd(timeFrame, i);
    const time = start.add(...add);

    return {
      time: (shouldFormat ? time.format(format) : time.valueOf()) as T,
      value: lastValue,
    };
  });
};

const generateOHLCData = <T extends Time = string>(
  length: number,
  {
    timeFrame = "1d",
    format = "YYYY-MM-DD",
    shouldFormat = true,
  }: GenerateDataCommonOptions = {}
): CandlestickData<T>[] => {
  const subtract = getObjectToSubtract(timeFrame, length);
  const start = dayjs().subtract(...subtract);
  let previousClose = Math.max(1, Math.random() * 100);

  return createStubArray(length).map((_, i) => {
    const add = getObjectToAdd(timeFrame, i);
    const open = previousClose;
    const high = open + Math.random() * 10;
    let low = open - Math.random() * 10;

    low = Math.max(0, low);

    const minimalDistance = 0.01;
    const adjustedHigh = Math.max(high, low + minimalDistance);

    const close = low + Math.random() * (adjustedHigh - low);

    previousClose = close;
    const time = start.add(...add);

    return {
      time: (shouldFormat ? time.format(format) : time.unix()) as T,
      open,
      high: adjustedHigh,
      low,
      close,
    };
  });
};

const generateHistogramData = <T extends Time = string>(
  length: number,
  {
    upColor,
    downColor,
    timeFrame = "1d",
    format = "YYYY-MM-DD",
    shouldFormat = true,
  }: GenerateHistogramDataOptions = {}
): HistogramData<T>[] => {
  const lineData = generateLineData<T>(length, { timeFrame, format, shouldFormat });

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
