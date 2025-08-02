import { generateOHLCData, generateLineData } from "@/common/generateSeriesData";

export type SeriesType = "ohlc" | "line";

export interface GenerateOptions {
  count: number;
  interval: number;
  seriesType: SeriesType;
}

export function generateSeriesData({ count, seriesType }: GenerateOptions) {
  if (seriesType === "ohlc") {
    return generateOHLCData(count);
  }
  if (seriesType === "line") {
    return generateLineData(count);
  }
  throw new Error("Unsupported series type: " + seriesType);
}
