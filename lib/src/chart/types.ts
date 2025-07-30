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
  /**
   * Children of the chart component.
   */
  children?: ReactNode;
  /**
   * The props for the container element on which the chart will be rendered.
   */
  containerProps?: JSX.IntrinsicElements["div"];
  /**
   * Callback function that is called when the chart is clicked.
   */
  onClick?: MouseEventHandler<Time>;
  /**
   * Callback function that is called when the crosshair moves.
   */
  onCrosshairMove?: MouseEventHandler<Time>;
  /**
   * Callback function that is called when the chart is initialized.
   */
  onInit?: (chart: IChartApi) => void; // TODO remove
  /**
   * Options for the chart.
   */
  options?: DeepPartial<ChartNativeOptions>;
  /**
   * Callback function that is called when the chart is double-clicked.
   */
  onDblClick?: MouseEventHandler<Time>;
};

/**
 * Chart API reference type that can be used to access the chart plugin API.
 */
export type ChartApiRef = {
  /**
   * Internal reference to the chart API instance.
   */
  _chart: IChartApi | null;
  /**
   * Function to get the chart API instance.
   */
  api: () => IChartApi | null;
  /**
   * Function to initialize the chart API instance.
   */
  init: () => IChartApi | null;
  /**
   * Function to clear the chart API instance.
   */
  clear: () => void;
};

/**
 * Chart context that provides access to the chart API and readiness state.
 */
export interface IChartContext {
  /**
   * Reference to the chart API.
   */
  chartApiRef: ChartApiRef | null;
  /**
   * Readiness state of the chart component.
   */
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
