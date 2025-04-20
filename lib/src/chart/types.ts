import {
  type ChartOptions as ChartNativeOptions,
  type DeepPartial,
  type IChartApi,
  type MouseEventHandler,
  type Time,
} from "lightweight-charts";
import type { JSX, ReactNode } from "react";

export type ChartCustomOptions = {
  onClick?: MouseEventHandler<Time>;
  onCrosshairMove?: MouseEventHandler<Time>;
  onInit?: (chart: IChartApi) => void;
  options?: DeepPartial<ChartNativeOptions>;
};

export type ChartProps = {
  children?: ReactNode;
  containerProps?: JSX.IntrinsicElements["div"];
} & ChartCustomOptions;

export type ChartApiRef = {
  _chart: IChartApi | null;
  api: () => IChartApi | null;
  init: () => IChartApi | null;
  clear: () => void;
};

export interface IChartContext {
  chartApiRef: ChartApiRef | null;
  isReady: boolean;
}
