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
  currency: string;
  setCurrency: (currency: string) => void;
}

interface ChartLocalizationOptionsStore {
  priceFormatter?: PriceFormatterFn;
  setPriceFormatter: (formatter: PriceFormatterFn | undefined) => void;
}

const createPriceFormatter = (currency: string): PriceFormatterFn => {
  return (price: number) => {
    return `${currency} ${price.toFixed(2)}`;
  };
};

const LKRFormatter = createPriceFormatter("Rs");
const AMDFormatter = createPriceFormatter("AMD");

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
const currencySelectOptions = [
  { value: "LKR", label: "LKR" },
  { value: "AMD", label: "AMD" },
] as const;

const getpriceScaleOptions = (t: PriceScaleType): DeepPartial<PriceScaleOptions> => {
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
  currency: "LKR",
  setCurrency: currency => set({ currency }),
}));

const useChartLocalizationOptionsStore = create<ChartLocalizationOptionsStore>(set => ({
  priceFormatter: LKRFormatter,
  setPriceFormatter: formatter => set({ priceFormatter: formatter }),
}));

usePriceScaleTypeStore.subscribe(state => {
  const { priceScaleType } = state;
  const { priceScaleOptions, setPriceScaleOptions } =
    usePriceScaleOptionsStore.getState();

  setPriceScaleOptions({
    ...priceScaleOptions,
    ...getpriceScaleOptions(priceScaleType),
  });
});

usePriceCurrencyStore.subscribe(state => {
  const { currency } = state;
  const { setPriceFormatter } = useChartLocalizationOptionsStore.getState();

  if (currency === "LKR") {
    setPriceFormatter(LKRFormatter);
  } else if (currency === "AMD") {
    setPriceFormatter(AMDFormatter);
  } else {
    setPriceFormatter(undefined);
  }
});

usePriceScaleTypeStore.subscribe(state => {
  const { priceScaleType } = state;
  const { setPriceFormatter } = useChartLocalizationOptionsStore.getState();
  const shouldFormatPrice =
    priceScaleType !== "percentage" && priceScaleType !== "logarithmic";

  if (shouldFormatPrice) {
    const { currency } = usePriceCurrencyStore.getState();
    setPriceFormatter(createPriceFormatter(currency));
  } else {
    setPriceFormatter(undefined);
  }
});

export {
  mainSeriesData,
  secondSeriesData,
  usePriceScalesNumberStore,
  usePriceScaleTypeStore,
  usePriceScalePositionStore,
  priceScaleTypeSelectOptions,
  priceScalesNumberSelectOptions,
  priceScalePositionSelectOptions,
  currencySelectOptions,
  usePriceScaleOptionsStore,
  usePriceCurrencyStore,
  useChartLocalizationOptionsStore,
};
