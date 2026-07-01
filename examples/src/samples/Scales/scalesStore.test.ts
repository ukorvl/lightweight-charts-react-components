import { describe, expect, it } from "vitest";
import { colors } from "@/common/colors";
import {
  buildVolumeDataFromCandles,
  getScalesChartOptions,
  samePaneVolumeScaleId,
  samePaneVolumeScaleOptions,
} from "@/samples/Scales/scalesStore";
import type { CandlestickData } from "lightweight-charts";

const formatter = (price: number) => `$${price.toFixed(2)}`;

describe("scalesStore", () => {
  it("builds single-axis chart options for the selected default scale", () => {
    const options = getScalesChartOptions({
      exampleMode: "default-scales",
      priceFormatter: formatter,
      priceScalePosition: "left",
      priceScalesNumber: 1,
    });

    expect(options.localization?.priceFormatter).toBe(formatter);
    expect(options.leftPriceScale).toEqual({ visible: true });
    expect(options.rightPriceScale).toEqual({ visible: false });
  });

  it("keeps both default axes visible when the dual-scale demo is selected", () => {
    const options = getScalesChartOptions({
      exampleMode: "default-scales",
      priceScalePosition: "right",
      priceScalesNumber: 2,
    });

    expect(options.leftPriceScale).toEqual({ visible: true });
    expect(options.rightPriceScale).toEqual({ visible: true });
  });

  it("pins the main price scale to one default axis in the single-pane volume demo", () => {
    const options = getScalesChartOptions({
      exampleMode: "single-pane-volume",
      priceScalePosition: "right",
      priceScalesNumber: 2,
    });

    expect(options.leftPriceScale).toEqual({ visible: false });
    expect(options.rightPriceScale).toEqual({ visible: true });
    expect(samePaneVolumeScaleId).toBe("volume");
    expect(samePaneVolumeScaleOptions.scaleMargins).toEqual({
      top: 0.72,
      bottom: 0,
    });
  });

  it("derives same-pane volume data from candlesticks with matching timestamps", () => {
    const candles: CandlestickData<string>[] = [
      {
        time: "2024-01-01",
        open: 10,
        high: 16,
        low: 8,
        close: 14,
      },
      {
        time: "2024-01-02",
        open: 14,
        high: 15,
        low: 9,
        close: 11,
      },
    ];

    expect(buildVolumeDataFromCandles(candles)).toEqual([
      {
        time: "2024-01-01",
        value: 12800,
        color: colors.blue,
      },
      {
        time: "2024-01-02",
        value: 9920,
        color: colors.orange100,
      },
    ]);
  });
});
