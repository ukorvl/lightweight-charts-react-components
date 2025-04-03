import { colors } from "@/colors";
import { generateLineData } from "@/common/generateSeriesData";
import { SeriesMarker, Time } from "lightweight-charts";
import { create } from "zustand";

interface MarkersStore {
  basicMarkersVisible: boolean;
  setBasicMarkersVisible: (visible: boolean) => void;
  getMarkersData: () => SeriesMarker<Time>[];
}

const useMarkersStore = create<MarkersStore>((set, get) => ({
  basicMarkersVisible: true,
  setBasicMarkersVisible: (visible) => set({ basicMarkersVisible: visible }),
  getMarkersData: () => {
    const { basicMarkersVisible } = get();
    return basicMarkersVisible ? basicMarkersData : [];
  },
}));

const seriesData = generateLineData(60);

const basicMarkersData = [
  {
    time: seriesData[5].time,
    color: colors.red,
    shape: "arrowUp",
    text: "Buy",
    position: "aboveBar",
    size: 2,
  },
  {
    time: seriesData[25].time,
    color: colors.green,
    shape: "arrowDown",
    text: "Sell",
    position: "belowBar",
    size: 2,
  },
  {
    time: seriesData[35].time,
    price: 140,
    color: colors.cyan,
    shape: "circle",
    text: "Neutral",
    position: "inBar",
    size: 2,
  },
  {
    time: seriesData[50].time,
    color: colors.pink,
    shape: "square",
    text: "Info",
    position: "inBar",
    size: 2,
  },
] satisfies SeriesMarker<Time>[];

export { useMarkersStore, seriesData };
