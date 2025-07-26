import { create } from "zustand";
import { colors } from "@/common/colors";
import { generateLineData } from "@/common/generateSeriesData";

type TooltipType = "Basic" | "Multiple series";

interface TabStore {
  activeTab: TooltipType;
  setActiveTab: (tab: TooltipType) => void;
}

const useTabStore = create<TabStore>(set => ({
  activeTab: "Basic",
  setActiveTab: tab => set({ activeTab: tab }),
}));

const basicTooltipSeriesData = generateLineData(100);
const multipleSeriesData = [
  { data: generateLineData(100), color: colors.red },
  { data: generateLineData(100), color: colors.green },
  { data: generateLineData(100), color: colors.orange100 },
  { data: generateLineData(100), color: colors.pink },
] as const;

export { useTabStore, basicTooltipSeriesData, multipleSeriesData, type TooltipType };
