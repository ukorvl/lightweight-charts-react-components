import { generateOHLCData, generateLineData } from "@/common/generateSeriesData";
import type { TimeFrame } from "@/common/timeFrame";
import type { SeriesType, UTCTimestamp } from "lightweight-charts";

type GenerateOptions = {
  count: number;
  timeFrame: TimeFrame;
  seriesType: SeriesType;
};

type GenerateMessage = {
  type: "generateAndSave";
  payload: {
    count: number;
    timeFrame: TimeFrame;
    seriesType: SeriesType;
  };
};

type DoneMessage = {
  type: "done";
  seriesType: SeriesType;
  count: number;
};

const generateMessageType = "generateAndSave" satisfies GenerateMessage["type"];
const doneMessageType = "done" satisfies DoneMessage["type"];

const generateSeriesData = ({ count, seriesType, timeFrame }: GenerateOptions) => {
  if (seriesType === "Candlestick" || seriesType === "Bar") {
    return generateOHLCData<UTCTimestamp>(count, {
      timeFrame,
      shouldFormat: false,
    });
  }

  if (seriesType === "Line" || seriesType === "Area") {
    return generateLineData<UTCTimestamp>(count, {
      timeFrame,
      shouldFormat: false,
    });
  }

  throw new Error("Unsupported series type: " + seriesType);
};

export { generateSeriesData, generateMessageType, doneMessageType };
export type { GenerateOptions, GenerateMessage, DoneMessage };
