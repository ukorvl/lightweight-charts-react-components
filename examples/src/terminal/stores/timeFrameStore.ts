import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TimeFrame } from "@/common/timeFrame";
import { TIME_FRAME_STORE_VERSION } from "./storeVersions";

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
      version: TIME_FRAME_STORE_VERSION,
    }
  )
);

export { useTimeFrameStore };
