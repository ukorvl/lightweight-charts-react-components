import { ColorType } from "lightweight-charts";
import type { ChartOptions, DeepPartial } from "lightweight-charts";
import { COLORS } from "../../shared";
import { priceScaleDefaultOptions } from "./scales";
import { timeScaleDefaultOptions } from "./scales/scalesDefaultOptions";

export const chartDefaultOptions: DeepPartial<ChartOptions> = {
  layout: {
    background: {
      type: ColorType.Solid,
      color: COLORS.gray900,
    },
    fontFamily: "Inter, sans-serif",
    textColor: COLORS.gray400,
  },
  grid: {
    vertLines: { visible: false },
    horzLines: { visible: false },
  },
  crosshair: {
    vertLine: {
      color: COLORS.gray50,
      width: 1,
      style: 0,
      visible: true,
      labelVisible: true,
    },
    horzLine: {
      color: COLORS.gray50,
      width: 1,
      style: 0,
      visible: true,
      labelVisible: true,
    },
    mode: 0,
  },
  localization: {
    locale: "en-US",
  },
  timeScale: timeScaleDefaultOptions,
  leftPriceScale: {
    visible: true,
    ...priceScaleDefaultOptions,
  },
  rightPriceScale: {
    visible: false,
    ...priceScaleDefaultOptions,
  },
};
