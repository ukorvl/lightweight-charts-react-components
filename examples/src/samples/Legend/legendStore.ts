import { create } from "zustand";

interface LegendStore {
  legendVisible: boolean;
  setLegendVisible: (visible: boolean) => void;
}

const useLegendStore = create<LegendStore>(set => ({
  legendVisible: true,
  setLegendVisible: visible => set({ legendVisible: visible }),
}));

export { useLegendStore };
