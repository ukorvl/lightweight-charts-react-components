import {
  type ChartOptions as ChartNativeOptions,
  type DeepPartial,
  type IChartApi,
  type MouseEventHandler,
  type Time,
} from "lightweight-charts";
import type { JSX, ReactNode } from "react";

export type ChartProps = {
  children?: ReactNode;
  containerProps?: JSX.IntrinsicElements["div"];
  onClick?: MouseEventHandler<Time>;
  onCrosshairMove?: MouseEventHandler<Time>;
  onInit?: (chart: IChartApi) => void; // TODO remove
  options?: DeepPartial<ChartNativeOptions>;
  onDblClick?: MouseEventHandler<Time>;
};

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

export type ChartComponentProps = {
  container: HTMLElement;
} & Omit<ChartProps, "containerProps">;

export type UseChartOptions = {
  container: HTMLElement;
} & Omit<ChartProps, "children" | "containerProps">;
