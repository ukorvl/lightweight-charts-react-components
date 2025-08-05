import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TimeFrame } from "@/common/timeInterval";

interface TimeFrameStore {
  timeFrame: TimeFrame;
  setTimeFrame: (timeFrame: TimeFrame) => void;
}

const useTimeFrameStore = create<TimeFrameStore>()(
  persist(
    set => ({
      timeFrame: "1d",
      setTimeFrame: (timeFrame: TimeFrame) => set(() => ({ timeFrame })),
    }),
    {
      name: "timeFrame-storage",
      version: 0,
    }
  )
);

export { useTimeFrameStore };
