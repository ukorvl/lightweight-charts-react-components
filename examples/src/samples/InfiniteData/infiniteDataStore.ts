import { create } from "zustand";
import { generateLineData } from "@/common/generateSeriesData";
import { sleep } from "@/common/utils";
import type { LineData } from "lightweight-charts";

interface InfiniteDataStore {
  data: LineData<string>[];
  loading: boolean;
  fetchMoreData: (n: number) => Promise<void>;
}

const initialData = generateLineData(100);

const useInfiniteDataStore = create<InfiniteDataStore>((set, get) => ({
  data: initialData,
  loading: false,
  fetchMoreData: async (numberBarsToLoad: number) => {
    const { data } = get();

    set({ loading: true });

    try {
      set({ loading: true });
      await sleep(500);

      const prevData = generateLineData(numberBarsToLoad, {
        lastItemTime: data[0].time,
      });

      set({ data: [...prevData, ...data] });
      set({ loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));

export { useInfiniteDataStore };
