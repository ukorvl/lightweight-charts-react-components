import { beforeAll, describe, expect, test } from "vitest";
import { prepareGlobalEnvironment } from "./utils";

const symbolsToTest = new Set([
  "Chart",
  "LineSeries",
  "AreaSeries",
  "BarSeries",
  "CandlestickSeries",
  "HistogramSeries",
  "PriceScale",
  "TimeScale",
  "CustomSeries",
  "BaselineSeries",
  "PriceLine",
  "TimeScaleFitContentTrigger",
  "WatermarkImage",
  "WatermarkText",
  "Markers",
  "SeriesPrimitive",
]);

describe.concurrent("Symbols", () => {
  beforeAll(async () => {
    await prepareGlobalEnvironment();
  });

  symbolsToTest.forEach(symbol => {
    test(`${symbol} is available globally`, async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((window as any).LightweightChartsReactComponents[symbol]).toBeDefined();
    });
  });
});
