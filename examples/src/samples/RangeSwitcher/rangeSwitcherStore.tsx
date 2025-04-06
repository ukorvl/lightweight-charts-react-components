import dayjs from "dayjs";
import { create } from "zustand";
import { createStubArray } from "@/common/utils";
import type { SeriesDataItemTypeMap, TimeFormatterFn } from "lightweight-charts";

type DataRange = "1d" | "1w" | "1m" | "1y";

interface RangeSwitcherStore {
  range: DataRange;
  setRange: (range: DataRange) => void;
}

interface SeriesDataStore {
  data: SeriesDataItemTypeMap["Area"][];
  setData: (data: SeriesDataItemTypeMap["Area"][]) => void;
}

const getSeriesDataByRange = (
  range: DataRange,
  dataLength = 50
): SeriesDataItemTypeMap["Area"][] => {
  const now = Math.floor(Date.now() / 1000);
  const oneDay = 86400;

  let startTime = now - dataLength * oneDay;
  switch (range) {
    case "1w":
      startTime = now - 7 * oneDay;
      break;
    case "1m":
      startTime = now - dataLength * 30 * oneDay;
      break;
    case "1y":
      startTime = now - dataLength * 365 * oneDay;
      break;
  }

  return createStubArray(dataLength).map((_, i) => {
    let time = startTime + i * oneDay;

    switch (range) {
      case "1w":
        time = startTime + i * oneDay * 7;
        break;
      case "1m":
        time = startTime + i * oneDay * 30;
        break;
      case "1y":
        time = startTime + i * oneDay * 365;
        break;
    }

    return {
      time: dayjs(time * 1000).format("YYYY-MM-DD"),
      value: Math.random() * 100,
    };
  });
};

const dataRangeMap: Record<
  DataRange,
  {
    formatter: TimeFormatterFn<string>;
    data: SeriesDataItemTypeMap["Area"][];
  }
> = {
  "1d": {
    formatter: t => dayjs(t).format("YYYY-MM-DD"),
    data: getSeriesDataByRange("1d"),
  },
  "1w": {
    formatter: t => dayjs(t).format("YYYY-MM-DD"),
    data: getSeriesDataByRange("1w"),
  },
  "1m": {
    formatter: t => dayjs(t).format("YYYY-MM"),
    data: getSeriesDataByRange("1m"),
  },
  "1y": {
    formatter: t => dayjs(t).format("YYYY"),
    data: getSeriesDataByRange("1y"),
  },
} as const;

const useDataRangeStore = create<RangeSwitcherStore>(set => ({
  range: "1d",
  setRange: (range: DataRange) => set({ range }),
}));

const useSeriesDataStore = create<SeriesDataStore>(set => ({
  data: dataRangeMap["1d"].data,
  setData: data => set({ data }),
}));

useDataRangeStore.subscribe(state => {
  const { range } = state;
  useSeriesDataStore.getState().setData(dataRangeMap[range].data);
});

export { useDataRangeStore, dataRangeMap, useSeriesDataStore };
