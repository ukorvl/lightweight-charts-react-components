import { create } from "zustand";
import { generateLineData } from "@/common/generateSeriesData";
import type { VerticalLineOptions } from "./primitives/VerticalLine";
import type { Time } from "lightweight-charts";

type PrimitiveData = {
  time: Time;
  uid: string;
  options?: Partial<VerticalLineOptions>;
};

interface MaxPrimitivesCountStore {
  maxPrimitivesCount: number;
  setMaxPrimitivesCount: (v: number) => void;
}

interface PrimitivesStore {
  primitives: PrimitiveData[];
  pushPrimitive: (primitive: PrimitiveData) => void;
  shiftPrimitives: (count: number) => void;
}

const areaSeries = generateLineData(50);

const maxPrimitivesCountOptions = [
  { value: 1, label: "1" },
  { value: 3, label: "3" },
  { value: 5, label: "5" },
] as const;

const useMaxPrimitivesCountStore = create<MaxPrimitivesCountStore>(set => ({
  maxPrimitivesCount: 3,
  setMaxPrimitivesCount: (v: number) => set(() => ({ maxPrimitivesCount: v })),
}));

const usePrimitivesStore = create<PrimitivesStore>(set => ({
  primitives: [],
  pushPrimitive: primitive =>
    set(state => {
      const { primitives } = state;
      const maxPrimitivesCount = useMaxPrimitivesCountStore.getState().maxPrimitivesCount;

      const newPrimitives = primitives
        .slice(primitives.length >= maxPrimitivesCount ? 1 : 0)
        .concat(primitive);

      return { primitives: newPrimitives };
    }),
  shiftPrimitives: count =>
    set(state => {
      const { primitives } = state;
      const newPrimitives = [...primitives];
      const primitivesToRemove = count;

      if (primitivesToRemove >= newPrimitives.length) {
        newPrimitives.length = 0;
      } else {
        newPrimitives.splice(0, primitivesToRemove);
      }

      return { primitives: newPrimitives };
    }),
}));

useMaxPrimitivesCountStore.subscribe(state => {
  const { maxPrimitivesCount } = state;
  const { primitives, shiftPrimitives } = usePrimitivesStore.getState();

  if (primitives.length > maxPrimitivesCount) {
    const excessCount = primitives.length - maxPrimitivesCount;
    shiftPrimitives(excessCount);
  }
});

export {
  areaSeries,
  useMaxPrimitivesCountStore,
  maxPrimitivesCountOptions,
  usePrimitivesStore,
  type PrimitiveData,
};
