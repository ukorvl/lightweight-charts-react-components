import type { ManipulateType } from "dayjs";

type TimeFrame =
  | "1s"
  | "5s"
  | "15s"
  | "30s"
  | "1m"
  | "5m"
  | "15m"
  | "30m"
  | "1h"
  | "4h"
  | "1d";

const TIME_FRAME_OPTIONS: TimeFrame[] = [
  "1s",
  "5s",
  "15s",
  "30s",
  "1m",
  "5m",
  "15m",
  "30m",
  "1h",
  "4h",
  "1d",
] as const;

const timeFrameToDayjsUnitMap: Record<TimeFrame, ManipulateType> = {
  "1s": "second",
  "5s": "second",
  "15s": "second",
  "30s": "second",
  "1m": "minute",
  "5m": "minute",
  "15m": "minute",
  "30m": "minute",
  "1h": "hour",
  "4h": "hour",
  "1d": "day",
};

const timeFrameMap: Record<TimeFrame, number> = {
  "1s": 1,
  "5s": 5,
  "15s": 15,
  "30s": 30,
  "1m": 1,
  "5m": 5,
  "15m": 15,
  "30m": 30,
  "1h": 1,
  "4h": 4,
  "1d": 1,
};

const timeFrameToSecondsMap: Record<TimeFrame, number> = {
  "1s": 1,
  "5s": 5,
  "15s": 15,
  "30s": 30,
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "30m": 1800,
  "1h": 3600,
  "4h": 14400,
  "1d": 86400,
};

const mapTimeFrameToDayjsUnit = (timeFrame: TimeFrame): ManipulateType => {
  const unit = timeFrameToDayjsUnitMap[timeFrame];
  if (unit === undefined) {
    throw new Error(`Unsupported time frame: ${timeFrame}`);
  }
  return unit;
};

const getTimeFrameDigit = (timeFrame: TimeFrame): number => {
  const digit = timeFrameMap[timeFrame];
  if (digit === undefined) {
    throw new Error(`Unsupported time frame: ${timeFrame}`);
  }
  return digit;
};

const getTimeFrameInSeconds = (timeFrame: TimeFrame): number => {
  const seconds = timeFrameToSecondsMap[timeFrame];
  if (seconds === undefined) {
    throw new Error(`Unsupported time frame: ${timeFrame}`);
  }
  return seconds;
};

export type { TimeFrame };
export {
  mapTimeFrameToDayjsUnit,
  getTimeFrameDigit,
  getTimeFrameInSeconds,
  TIME_FRAME_OPTIONS,
};
