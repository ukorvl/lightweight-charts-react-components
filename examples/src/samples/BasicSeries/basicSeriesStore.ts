/* eslint-disable @typescript-eslint/no-explicit-any */

import { SeriesDataItemTypeMap } from "lightweight-charts";
import {
  AreaSeries,
  BarSeries,
  BaselineSeries,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
} from "lightweight-charts-react-components";
import { ComponentType } from "react";
import { create } from "zustand";

type BasicSeriesType = Exclude<keyof SeriesDataItemTypeMap, "Custom">;

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

const basicSeriesMap = new Map<
  BasicSeriesType,
  {
    Component: ComponentType<any>;
    codeSnippetPath: string;
  }
>([
  [
    "Line",
    {
      Component: LineSeries,
      codeSnippetPath: "/ls",
    },
  ],
  [
    "Bar",
    {
      Component: BarSeries,
      codeSnippetPath: "/bs",
    },
  ],
  [
    "Area",
    {
      Component: AreaSeries,
      codeSnippetPath: "/as",
    },
  ],
  [
    "Histogram",
    {
      Component: HistogramSeries,
      codeSnippetPath: "/hs",
    },
  ],
  [
    "Baseline",
    {
      Component: BaselineSeries,
      codeSnippetPath: "/bls",
    },
  ],
  [
    "Candlestick",
    {
      Component: CandlestickSeries,
      codeSnippetPath: "/cs",
    },
  ],
]);

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

const dataStub = new Array(30).fill(0);

const timeSeriesData = dataStub.map((_, i) => ({
  time: `2024-03-${String(i + 1).padStart(2, "0")}`,
  value: Math.floor(Math.random() * 100),
}));

const ohlcSeriesData = dataStub.map((_, i) => ({
  time: `2024-03-${String(i + 1).padStart(2, "0")}`,
  open: Math.random() * 100,
  high: Math.random() * 100,
  low: Math.random() * 100,
  close: Math.random() * 100,
}));

const useTabStore = create<TabStore>((set) => ({
  activeTab: "Line",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));

const useSeriesStore = create<SeriesDataStore>((set) => ({
  seriesComponent: LineSeries,
  seriesData: getSeriesDataByTab(useTabStore.getState().activeTab),
  setSeriesData: (data) => set({ seriesData: data }),
  setSeriesComponent: (Component) => set({ seriesComponent: Component }),
}));

useTabStore.subscribe((state) => {
  const activeTab = state.activeTab;

  useSeriesStore
    .getState()
    .setSeriesComponent(basicSeriesMap.get(activeTab)?.Component ?? null);
  useSeriesStore.getState().setSeriesData(getSeriesDataByTab(activeTab));
});

export { useTabStore, useSeriesStore, basicSeriesMap };
