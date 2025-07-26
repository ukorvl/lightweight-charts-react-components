import { create } from "zustand";
import { colors } from "@/common/colors";
import { generateOHLCData } from "@/common/generateSeriesData";
import type { SeriesMarker, Time } from "lightweight-charts";

interface MarkersStore {
  basicMarkersVisible: boolean;
  setBasicMarkersVisible: (visible: boolean) => void;
  getMarkersData: () => SeriesMarker<Time>[];
}

const useMarkersStore = create<MarkersStore>((set, get) => ({
  basicMarkersVisible: true,
  setBasicMarkersVisible: visible => set({ basicMarkersVisible: visible }),
  getMarkersData: () => {
    const { basicMarkersVisible } = get();
    return basicMarkersVisible ? basicMarkersData : [];
  },
}));

const seriesData = generateOHLCData(40);

const basicMarkersData = [
  {
    time: seriesData[5].time,
    color: colors.green,
    shape: "arrowUp",
    text: "Buy",
    position: "belowBar",
    size: 2,
  },
  {
    time: seriesData[25].time,
    color: colors.red,
    shape: "arrowDown",
    text: "Sell",
    position: "aboveBar",
    size: 2,
  },
  {
    time: seriesData[35].time,
    price: Math.max(...seriesData.map(d => d.high)),
    color: colors.orange,
    shape: "circle",
    text: "D",
    position: "atPriceTop",
    size: 2,
  },
] satisfies SeriesMarker<Time>[];

export { useMarkersStore, seriesData };
