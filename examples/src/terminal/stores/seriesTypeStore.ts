import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SERIES_TYPE_STORE_VERSION } from "./storeVersions";
import type { SeriesType } from "lightweight-charts";

interface SeriesTypeStore {
  seriesType: SeriesType;
  setSeriesType: (seriesType: SeriesType) => void;
}

const useSeriesTypeStore = create<SeriesTypeStore>()(
  persist(
    set => ({
      seriesType: "Candlestick",
      setSeriesType: (seriesType: SeriesType) => set({ seriesType }),
    }),
    {
      name: "seriesType-storage",
      version: SERIES_TYPE_STORE_VERSION,
    }
  )
);

export { useSeriesTypeStore };
