import { PriceScaleMode } from "lightweight-charts";
import { create } from "zustand";
import { colors } from "@/common/colors";
import { generateHistogramData, generateLineData } from "@/common/generateSeriesData";
import type {
  DeepPartial,
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

const mainSeriesData = generateLineData(50);
const secondSeriesData = generateHistogramData(50, {
  upColor: colors.green,
  downColor: colors.red,
});

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

const usePriceScalePositionStore = create<PriceScalePositionStore>(set => ({
  priceScalePosition: "right",
  setPriceScalePosition: v => set({ priceScalePosition: v }),
}));

const usePriceScalesNumberStore = create<PriceScalesNumberStore>(set => ({
  priceScalesNumber: 1,
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
  createPriceFormatter,
  currencySelectOptions,
  mainSeriesData,
  priceScalePositionSelectOptions,
  priceScaleTypeSelectOptions,
  priceScalesNumberSelectOptions,
  secondSeriesData,
  usePriceCurrencyStore,
  usePriceScaleOptionsStore,
  usePriceScalePositionStore,
  usePriceScaleTypeStore,
  usePriceScalesNumberStore,
};
