import dayjs from "dayjs";
import { create } from "zustand";
import { generateOHLCData } from "@/common/generateSeriesData";
import type { CandlestickData } from "lightweight-charts";

let interval: NodeJS.Timeout | null = null;

interface RealTimeSampleStore {
  reactive: boolean;
  resizeOnUpdate: boolean;
  data: CandlestickData[];
  setReactive: (reactive: boolean) => void;
  setResizeOnUpdate: (resizeOnUpdate: boolean) => void;
  setData: (data: CandlestickData[]) => void;
  startSimulation: () => void;
  stopSimulation: () => void;
}

const generateNextDataPoint = (last: CandlestickData): CandlestickData => {
  const time = dayjs(last.time.toString()).add(1, "day").format("YYYY-MM-DD");

  const open = last.close;

  const volatility = (Math.random() * open) / 10 + 1;
  const direction = Math.random() > 0.5 ? 1 : -1;
  const change = volatility * direction;
  const minThreshold = 5;

  const close =
    open + change >= minThreshold
      ? open + change
      : open - change < -minThreshold
        ? open - change
        : open + change;

  const high = Math.max(open, close) + volatility / 2;
  const potentialLow = Math.min(open, close) - volatility / 2;
  const low = potentialLow >= minThreshold ? potentialLow : Math.max(open, close);

  return { time, open, high, low, close };
};

const useRealTimeSampleStore = create<RealTimeSampleStore>(set => ({
  reactive: true,
  resizeOnUpdate: false,
  data: generateOHLCData(50),
  setReactive: (reactive: boolean) => set({ reactive }),
  setResizeOnUpdate: (resizeOnUpdate: boolean) => set({ resizeOnUpdate }),
  setData: (data: CandlestickData[]) => set(() => ({ data })),
  startSimulation: () => {
    if (interval) return;

    interval = setInterval(() => {
      set(state => {
        const last = state.data[state.data.length - 1];
        const next = generateNextDataPoint(last);
        const dataLimit = 300;

        return {
          data:
            state.data.length >= dataLimit
              ? [...state.data.slice(1), next]
              : [...state.data, next],
        };
      });
    }, 1000);
  },

  stopSimulation: () => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  },
}));

export { useRealTimeSampleStore };
