import { PriceScaleOptions, TimeScaleOptions } from "./types";

export const priceScaleDefaultOptions = {
  borderVisible: false,
  scaleMargins: {
    top: 0.1,
    bottom: 0.1,
  },
  minimumWidth: 48,
} satisfies PriceScaleOptions;

export const timeScaleDefaultOptions = {
  borderVisible: false,
  tickMarkMaxCharacterLength: 15,
} satisfies TimeScaleOptions;
