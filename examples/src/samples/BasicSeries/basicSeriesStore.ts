import {
  AreaSeries,
  BarSeries,
  BaselineSeries,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
} from "lightweight-charts-react-components";
import { create } from "zustand";
import { colors } from "@/colors";
import { generateLineData, generateOHLCData } from "@/common/generateSeriesData";
import type { SeriesDataItemTypeMap } from "lightweight-charts";
import type { SeriesProps } from "lightweight-charts-react-components";
import type { ComponentType } from "react";

type BasicSeriesType = Exclude<keyof SeriesDataItemTypeMap, "Custom">;

type BasicSeriesMap<K extends BasicSeriesType> = {
  [key in K]: {
    Component: ComponentType<SeriesProps<K>>;
    options?: SeriesProps<K>["options"];
  };
};

interface TabStore {
  activeTab: BasicSeriesType;
  setActiveTab: (tab: BasicSeriesType) => void;
}

interface SeriesDataStore {
  seriesComponent: ComponentType<SeriesProps<BasicSeriesType>> | null;
  seriesData: SeriesDataItemTypeMap[BasicSeriesType][];
  setSeriesData: (data: SeriesDataItemTypeMap[BasicSeriesType][]) => void;
  setSeriesComponent: (
    Component: ComponentType<SeriesProps<BasicSeriesType>> | null
  ) => void;
}

const timeSeriesData = generateLineData(50);
const ohlcSeriesData = generateOHLCData(50);

const basicSeriesMap: BasicSeriesMap<BasicSeriesType> = {
  Candlestick: {
    Component: CandlestickSeries,
    options: {
      upColor: colors.green,
      downColor: colors.red,
      borderUpColor: colors.green,
      borderDownColor: colors.red,
      wickUpColor: colors.green,
      wickDownColor: colors.red,
    },
  },
  Line: {
    Component: LineSeries,
  },
  Bar: {
    Component: BarSeries,
    options: {
      upColor: colors.green,
      downColor: colors.red,
    },
  },
  Area: {
    Component: AreaSeries,
    options: {
      topColor: colors.pink,
      bottomColor: `${colors.pink}20`,
      lineColor: colors.pink,
    },
  },
  Histogram: {
    Component: HistogramSeries,
  },
  Baseline: {
    Component: BaselineSeries,
    options: {
      baseValue: {
        type: "price",
        price:
          (Math.min(...timeSeriesData.map(item => item.value)) +
            Math.max(...timeSeriesData.map(item => item.value))) /
          2,
      },
      topLineColor: colors.green,
      bottomLineColor: colors.red,
    },
  },
};

const getSeriesDataByTab = (tab: BasicSeriesType) => {
  switch (tab) {
    case "Line":
    case "Area":
    case "Baseline":
      return timeSeriesData;
    case "Candlestick":
    case "Bar":
      return ohlcSeriesData;
    case "Histogram":
      return timeSeriesData;
    default:
      return [];
  }
};

const useTabStore = create<TabStore>(set => ({
  activeTab: "Candlestick",
  setActiveTab: tab => set({ activeTab: tab }),
}));

const useSeriesStore = create<SeriesDataStore>(set => ({
  seriesComponent: CandlestickSeries,
  seriesData: getSeriesDataByTab(useTabStore.getState().activeTab),
  setSeriesData: data => set({ seriesData: data }),
  setSeriesComponent: Component => set({ seriesComponent: Component }),
}));

useTabStore.subscribe(state => {
  const activeTab = state.activeTab;

  useSeriesStore
    .getState()
    .setSeriesComponent(basicSeriesMap[activeTab]?.Component ?? null);
  useSeriesStore.getState().setSeriesData(getSeriesDataByTab(activeTab));
});

export { useTabStore, useSeriesStore, basicSeriesMap };
