import type {
  ChartOptions as ChartNativeOptions,
  DeepPartial,
  IChartApi,
  LineData,
  MouseEventHandler,
  Time,
} from "lightweight-charts";
import { ReactNode } from "react";

export type ChartOptions = {
  onClick?: MouseEventHandler<Time>;
  onCrosshairMove?: MouseEventHandler<Time>;
  onInit?: ChartInitHandler;
} & DeepPartial<ChartNativeOptions>;

export type ChartInitHandler = (chart: IChartApi) => void;

export type ChartProps = {
  children?: ReactNode;
  className?: string;
} & ChartOptions;

export type ChartApiRef = {
  _chart: IChartApi | null;
  api: () => IChartApi | null;
  clear: () => void;
  destroyed: boolean;
};

export type ChartWidgetProps = {
  data: LineData[];
  color?: string;
} & Omit<ChartProps, "children" | "onCrosshairMove">;
