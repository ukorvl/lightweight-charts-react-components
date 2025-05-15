import { create } from "zustand";
import { colors } from "@/colors";
import { generateOHLCData } from "@/common/generateSeriesData";
import type { PriceLineProps } from "lightweight-charts-react-components";

interface PriceLinesControlsStore {
  maxPriceVisible: boolean;
  minPriceVisible: boolean;
  avgPriceVisible: boolean;
  setMaxPriceVisible: (visible: boolean) => void;
  setMinPriceVisible: (visible: boolean) => void;
  setAvgPriceVisible: (visible: boolean) => void;
}

interface PriceLinesStore {
  priceLines: PriceLineProps[];
  setPriceLines: (priceLines: PriceLineProps[]) => void;
}

const seriesData = generateOHLCData(60);

let minPrice = 0;
let maxPrice = 0;

for (let i = 0; i < seriesData.length; i++) {
  const dataPoint = seriesData[i];
  if (dataPoint.high > maxPrice) {
    maxPrice = dataPoint.high;
  }
  if (dataPoint.low < minPrice || minPrice === 0) {
    minPrice = dataPoint.low;
  }
}

const averagePrice = (maxPrice + minPrice) / 2;

const maxPriceLine = {
  price: maxPrice,
  options: {
    title: "Max Price",
    color: colors.violet,
    lineWidth: 2,
    axisLabelVisible: true,
    lineStyle: 0,
  },
} as const;

const minPriceLine = {
  price: minPrice,
  options: {
    title: "Min Price",
    color: colors.red,
    lineWidth: 2,
    axisLabelVisible: true,
    lineStyle: 0,
  },
} as const;

const averagePriceLine = {
  price: averagePrice,
  options: {
    title: "Average Price",
    color: colors.pink,
    lineWidth: 2,
    axisLabelVisible: true,
    lineStyle: 3,
  },
} as const;

const usePriceLinesControlsStore = create<PriceLinesControlsStore>(set => ({
  maxPriceVisible: true,
  minPriceVisible: true,
  avgPriceVisible: true,
  setMaxPriceVisible: visible => set({ maxPriceVisible: visible }),
  setMinPriceVisible: visible => set({ minPriceVisible: visible }),
  setAvgPriceVisible: visible => set({ avgPriceVisible: visible }),
}));

const usePriceLinesStore = create<PriceLinesStore>(set => ({
  priceLines: [maxPriceLine, minPriceLine, averagePriceLine],
  setPriceLines: priceLines => set({ priceLines }),
}));

usePriceLinesControlsStore.subscribe(state => {
  const { maxPriceVisible, minPriceVisible, avgPriceVisible } = state;

  const priceLines = [];

  if (maxPriceVisible) {
    priceLines.push(maxPriceLine);
  }

  if (minPriceVisible) {
    priceLines.push(minPriceLine);
  }

  if (avgPriceVisible) {
    priceLines.push(averagePriceLine);
  }

  usePriceLinesStore.getState().setPriceLines(priceLines);
});

export { seriesData, usePriceLinesStore, usePriceLinesControlsStore };
