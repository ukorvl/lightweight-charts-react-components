import { type LineData } from "lightweight-charts";
import { create } from "zustand";
import { colors } from "@/common/colors";
import { generateLineData } from "@/common/generateSeriesData";
import { LineSeries } from "lightweight-charts-react-components";
import type { SeriesProps } from "lightweight-charts-react-components";
import type { SeriesType } from "lightweight-charts";
import type { ComponentType } from "react";

type CompareSeriesType = "Asset B" | "SMA 14" | "EMA 14";

type CompareSeriesMap<T extends CompareSeriesType, P extends SeriesType> = {
  [key in T]: {
    Component: ComponentType<SeriesProps<P>>;
    data: SeriesProps<P>["data"];
    options?: SeriesProps<P>["options"];
    chipColor: string;
  };
};

interface CompareSeriesStore {
  visibleSeries: CompareSeriesType[];
  toggleSeriesVisibility: (series: CompareSeriesType) => void;
}

const calculateSMA = (data: LineData[], period = 14) => {
  const smaData: LineData[] = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data
      .slice(i - period + 1, i + 1)
      .reduce((acc, curr) => acc + curr.value, 0);
    const avg = sum / period;
    smaData.push({ time: data[i].time, value: avg });
  }
  return smaData;
};

const calculateEMA = (data: LineData[], period = 14) => {
  const k = 2 / (period + 1);
  const emaData: LineData[] = [];
  let prevEma = data[0].value;

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      emaData.push({ time: data[i].time, value: prevEma });
      continue;
    }
    const currentEma = data[i].value * k + prevEma * (1 - k);
    emaData.push({ time: data[i].time, value: currentEma });
    prevEma = currentEma;
  }
  return emaData;
};

const dataLength = 100;
const mainSeriesData = generateLineData(dataLength);
const secondSeriesData = generateLineData(dataLength);

const seriesMap: CompareSeriesMap<CompareSeriesType, SeriesType> = {
  "Asset B": {
    data: secondSeriesData,
    Component: LineSeries,
    chipColor: colors.violet,
    options: {
      color: colors.violet,
    },
  },
  "SMA 14": {
    data: calculateSMA(mainSeriesData, 14),
    Component: LineSeries,
    chipColor: colors.green,
    options: {
      color: colors.green,
      priceLineVisible: false,
      lineWidth: 2,
    },
  },
  "EMA 14": {
    data: calculateEMA(mainSeriesData),
    Component: LineSeries,
    chipColor: colors.orange100,
    options: {
      color: colors.orange100,
      priceLineVisible: false,
      lineWidth: 2,
    },
  },
};

const useCompareSeriesStore = create<CompareSeriesStore>(set => ({
  visibleSeries: [],
  toggleSeriesVisibility: series =>
    set(state => {
      const isSelected = state.visibleSeries.includes(series);
      return {
        visibleSeries: isSelected
          ? state.visibleSeries.filter(s => s !== series)
          : [...state.visibleSeries, series],
      };
    }),
}));

export { seriesMap, useCompareSeriesStore, mainSeriesData };
