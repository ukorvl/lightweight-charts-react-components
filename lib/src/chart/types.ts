import {
  type ChartOptions as ChartNativeOptions,
  type DeepPartial,
  type IChartApi,
  type MouseEventHandler,
  type Time,
  type IPaneApi,
} from "lightweight-charts";
import type { JSX, ReactNode } from "react";

export type ExtendedChartApi = IChartApi & {
  addPane: (paneIndex: number) => IPaneApi<Time>;
};

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
  _chart: ExtendedChartApi | null;
  api: () => ExtendedChartApi | null;
  init: () => ExtendedChartApi | null;
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
