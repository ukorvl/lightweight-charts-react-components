import { PriceScaleMode } from "lightweight-charts";
import { create } from "zustand";
import { withChartCommonOptions } from "@/common/chartCommonOptions";
import { colors } from "@/common/colors";
import { generateOHLCData } from "@/common/generateSeriesData";
import type {
  CandlestickData,
  ChartOptions,
  DeepPartial,
  HistogramData,
  LineData,
  PriceFormatterFn,
  PriceScaleOptions,
} from "lightweight-charts";

type PriceScaleType = "normal" | "logarithmic" | "percentage" | "inverted";
type PriceScalePosition = "left" | "right";
const currencySelectOptions = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "JPY", label: "JPY (¥)" },
] as const;
type PriceCurrency = (typeof currencySelectOptions)[number]["value"];

interface PriceScalePositionStore {
  priceScalePosition: PriceScalePosition;
  setPriceScalePosition: (v: PriceScalePosition) => void;
}

interface PriceScalesNumberStore {
  priceScalesNumber: number;
  setPriceScalesNumber: (v: number) => void;
}

interface PriceScaleTypeStore {
  priceScaleType: PriceScaleType;
  setPriceScaleType: (v: PriceScaleType) => void;
}

interface PriceScaleOptionsStore {
  priceScaleOptions: DeepPartial<PriceScaleOptions>;
  setPriceScaleOptions: (o: DeepPartial<PriceScaleOptions>) => void;
}

interface PriceCurrencyStore {
  currency: PriceCurrency;
  setCurrency: (currency: PriceCurrency) => void;
}

const createPriceFormatter = (currency: PriceCurrency): PriceFormatterFn => {
  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  });

  return (price: number) => formatter.format(price);
};

const samePaneCandlestickData = generateOHLCData(60);
const samePaneVolumeScaleId = "whatever";

const priceScaleTypeSelectOptions = [
  { value: "normal", label: "Normal" },
  { value: "logarithmic", label: "Logarithmic" },
  { value: "percentage", label: "Percentage" },
  { value: "inverted", label: "Inverted" },
] as const;
const priceScalePositionSelectOptions = [
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
] as const;
const priceScalesNumberSelectOptions = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
] as const;

const getPriceScaleOptions = (t: PriceScaleType): DeepPartial<PriceScaleOptions> => {
  switch (t) {
    case "normal":
      return { mode: PriceScaleMode.Normal, invertScale: false };
    case "logarithmic":
      return { mode: PriceScaleMode.Logarithmic, invertScale: false };
    case "percentage":
      return { mode: PriceScaleMode.Percentage, invertScale: false };
    case "inverted":
      return { mode: PriceScaleMode.Normal, invertScale: true };
  }
};

const buildSecondarySeriesDataFromCandles = (
  candlestickData: CandlestickData<string>[]
): LineData<string>[] =>
  candlestickData.map((candle, index) => ({
    time: candle.time,
    value: Number((candle.close * 0.82 + index * 1.35 + 16).toFixed(2)),
  }));

/** @lintignore Used by unit tests to validate the example's derived volume data. */
const buildVolumeDataFromCandles = (
  candlestickData: CandlestickData<string>[]
): HistogramData<string>[] =>
  candlestickData.map((candle, index) => ({
    time: candle.time,
    value: Math.round((candle.high - candle.low) * 1_500 + (index % 5) * 120 + 800),
    color: candle.close >= candle.open ? colors.blue : colors.orange100,
  }));

const secondSeriesData = buildSecondarySeriesDataFromCandles(samePaneCandlestickData);
const samePaneVolumeData = buildVolumeDataFromCandles(samePaneCandlestickData);

const samePaneVolumeScaleOptions = {
  scaleMargins: {
    top: 0.72,
    bottom: 0,
  },
} satisfies DeepPartial<PriceScaleOptions>;

type GetScalesChartOptionsParams = {
  priceFormatter?: PriceFormatterFn;
  priceScalePosition: PriceScalePosition;
  priceScalesNumber: number;
};

const getScalesChartOptions = ({
  priceFormatter,
  priceScalePosition,
  priceScalesNumber,
}: GetScalesChartOptionsParams): DeepPartial<ChartOptions> => {
  const localizationOptions: DeepPartial<ChartOptions> = priceFormatter
    ? {
        localization: {
          priceFormatter,
        },
      }
    : {};

  const singleDefaultScaleOptions: DeepPartial<ChartOptions> =
    priceScalePosition === "left"
      ? { leftPriceScale: { visible: true }, rightPriceScale: { visible: false } }
      : { leftPriceScale: { visible: false }, rightPriceScale: { visible: true } };

  if (priceScalesNumber === 1) {
    return withChartCommonOptions({
      ...localizationOptions,
      ...singleDefaultScaleOptions,
    });
  }

  return withChartCommonOptions({
    ...localizationOptions,
    leftPriceScale: { visible: true },
    rightPriceScale: { visible: true },
  });
};

const usePriceScalePositionStore = create<PriceScalePositionStore>(set => ({
  priceScalePosition: "right",
  setPriceScalePosition: v => set({ priceScalePosition: v }),
}));

const usePriceScalesNumberStore = create<PriceScalesNumberStore>(set => ({
  priceScalesNumber: 2,
  setPriceScalesNumber: v => set({ priceScalesNumber: v }),
}));

const usePriceScaleTypeStore = create<PriceScaleTypeStore>(set => ({
  priceScaleType: "normal",
  setPriceScaleType: v => set({ priceScaleType: v }),
}));

const usePriceScaleOptionsStore = create<PriceScaleOptionsStore>(set => ({
  priceScaleOptions: { visible: true },
  setPriceScaleOptions: o => set({ priceScaleOptions: o }),
}));

const usePriceCurrencyStore = create<PriceCurrencyStore>(set => ({
  currency: "USD",
  setCurrency: currency => set({ currency }),
}));

usePriceScaleTypeStore.subscribe(state => {
  const { priceScaleType } = state;
  const { priceScaleOptions, setPriceScaleOptions } =
    usePriceScaleOptionsStore.getState();

  setPriceScaleOptions({
    ...priceScaleOptions,
    ...getPriceScaleOptions(priceScaleType),
  });
});

export {
  buildVolumeDataFromCandles,
  createPriceFormatter,
  currencySelectOptions,
  getScalesChartOptions,
  priceScalePositionSelectOptions,
  priceScaleTypeSelectOptions,
  priceScalesNumberSelectOptions,
  samePaneCandlestickData,
  samePaneVolumeData,
  samePaneVolumeScaleId,
  samePaneVolumeScaleOptions,
  secondSeriesData,
  usePriceCurrencyStore,
  usePriceScaleOptionsStore,
  usePriceScalePositionStore,
  usePriceScaleTypeStore,
  usePriceScalesNumberStore,
  type PriceScalePosition,
};
