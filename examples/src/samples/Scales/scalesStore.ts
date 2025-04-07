import { PriceScaleMode } from "lightweight-charts";
import { create } from "zustand";
import { colors } from "@/colors";
import { generateHistogramData, generateLineData } from "@/common/generateSeriesData";
import type { DeepPartial, PriceScaleOptions } from "lightweight-charts";

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

usePriceScaleTypeStore.subscribe(state => {
  const { priceScaleType } = state;
  const { priceScaleOptions, setPriceScaleOptions } =
    usePriceScaleOptionsStore.getState();

  setPriceScaleOptions({
    ...priceScaleOptions,
    ...getpriceScaleOptions(priceScaleType),
  });
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
  usePriceScaleOptionsStore,
};
