import {
  type ChartOptions as ChartNativeOptions,
  type DeepPartial,
  type IChartApi,
  type MouseEventHandler,
  type Time,
} from "lightweight-charts";
import type { JSX, ReactNode } from "react";

/**
 * Chart component props.
 */
export type ChartProps = {
  children?: ReactNode;
  containerProps?: JSX.IntrinsicElements["div"];
  onClick?: MouseEventHandler<Time>;
  onCrosshairMove?: MouseEventHandler<Time>;
  options?: DeepPartial<ChartNativeOptions>;
  onDblClick?: MouseEventHandler<Time>;
};

/**
 * Chart API reference type that can be used to access the chart plugin API.
 */
export type ChartApiRef = {
  _chart: IChartApi | null;
  api: () => IChartApi | null;
  init: () => IChartApi | null;
  clear: () => void;
};

/**
 * Chart context that provides access to the chart API and readiness state.
 */
export interface IChartContext {
  chartApiRef: ChartApiRef | null;
  isReady: boolean;
}

/**
 * Chart component properties that can be used to create a chart.
 */
export type ChartComponentProps = {
  container: HTMLElement;
} & Omit<ChartProps, "containerProps">;

/**
 * Options for the useChart hook.
 */
export type UseChartOptions = {
  container: HTMLElement;
} & Omit<ChartProps, "children" | "containerProps">;
