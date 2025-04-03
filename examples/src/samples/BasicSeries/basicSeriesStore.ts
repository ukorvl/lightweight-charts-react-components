/* eslint-disable @typescript-eslint/no-explicit-any */

import { colors } from "@/colors";
import { generateLineData, generateOHLCData } from "@/common/generateSeriesData";
import { SeriesDataItemTypeMap } from "lightweight-charts";
import {
  AreaSeries,
  BarSeries,
  BaselineSeries,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  SeriesProps,
} from "lightweight-charts-react-components";
import { ComponentType } from "react";
import { create } from "zustand";

type BasicSeriesType = Exclude<keyof SeriesDataItemTypeMap, "Custom">;

type BasicSeriesMap<K extends BasicSeriesType> = {
  [key in K]: {
    Component: ComponentType<any>;
    options?: SeriesProps<K>["options"];
  };
};

interface TabStore {
  activeTab: BasicSeriesType;
  setActiveTab: (tab: BasicSeriesType) => void;
}

interface SeriesDataStore {
  seriesComponent: ComponentType<any> | null;
  seriesData: any[];
  setSeriesData: (data: any) => void;
  setSeriesComponent: (Component: ComponentType<any> | null) => void;
}

const basicSeriesMap: BasicSeriesMap<BasicSeriesType> = {
  Candlestick: {
    Component: CandlestickSeries,
  },
  Line: {
    Component: LineSeries,
  },
  Bar: {
    Component: BarSeries,
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
      baseValue: { type: "price", price: 50 },
      topLineColor: colors.green,
      bottomLineColor: colors.red,
    },
  },
};//   [
//     "Candlestick",
//     {
//       Component: CandlestickSeries,
//     },
//   ],
//   [
//     "Line",
//     {
//       Component: LineSeries,
//     },
//   ],
//   [
//     "Bar",
//     {
//       Component: BarSeries,
//     },
//   ],
//   [
//     "Area",
//     {
//       Component: AreaSeries,
//       options: {
//         topLineColor: colors.blue100,
//         bottomLineColor: colors.red,
//         crossHairMarkerVisible: true,
//         crossHairMarkerRadius: 5,
//         crossHairMarkerBorderWidth: 2,
//         crossHairMarkerBorderColor: colors.red,
//       },
//     },
//   ],
//   [
//     "Histogram",
//     {
//       Component: HistogramSeries,
//     },
//   ],
//   [
//     "Baseline",
//     {
//       Component: BaselineSeries,
//       options: {
//         baseValue: { type: "price", price: 50 },
//         topLineColor: colors.green,
//         bottomLineColor: colors.red,
//       },
//     },
//   ],
// ]);

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

const timeSeriesData = generateLineData(50);
const ohlcSeriesData = generateOHLCData(50);

const useTabStore = create<TabStore>((set) => ({
  activeTab: "Candlestick",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));

const useSeriesStore = create<SeriesDataStore>((set) => ({
  seriesComponent: CandlestickSeries,
  seriesData: getSeriesDataByTab(useTabStore.getState().activeTab),
  setSeriesData: (data) => set({ seriesData: data }),
  setSeriesComponent: (Component) => set({ seriesComponent: Component }),
}));

useTabStore.subscribe((state) => {
  const activeTab = state.activeTab;

  useSeriesStore
    .getState()
    .setSeriesComponent(basicSeriesMap[activeTab]?.Component ?? null);
  useSeriesStore.getState().setSeriesData(getSeriesDataByTab(activeTab));
});

export { useTabStore, useSeriesStore, basicSeriesMap };
