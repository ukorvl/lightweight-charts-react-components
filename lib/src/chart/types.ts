import {
  type ChartOptions as TimeChartOptions,
  type ChartOptionsBase,
  type ChartOptionsImpl,
  type DeepPartial,
  type IChartApi,
  type IChartApiBase,
  type IHorzScaleBehavior,
  type IYieldCurveChartApi,
  type MouseEventHandler,
  type PriceChartOptions,
  type Time,
  type YieldCurveChartOptions,
} from "lightweight-charts";
import type { JSX, ReactNode } from "react";

/**
 * Supported internal chart kinds.
 */
export type ChartKind = "time" | "options" | "yield-curve" | "custom";

/**
 * Common chart API surface used by the React wrapper.
 */
export type ChartApiInstance<HorzScaleItem = Time> = Pick<
  IChartApiBase<HorzScaleItem>,
  | "applyOptions"
  | "remove"
  | "subscribeClick"
  | "unsubscribeClick"
  | "subscribeCrosshairMove"
  | "unsubscribeCrosshairMove"
  | "subscribeDblClick"
  | "unsubscribeDblClick"
>;

/**
 * Generic chart component props.
 */
export type GenericChartProps<
  HorzScaleItem = Time,
  TChartApi extends ChartApiInstance<HorzScaleItem> = ChartApiInstance<HorzScaleItem>,
  TOptions extends ChartOptionsImpl<HorzScaleItem> = ChartOptionsImpl<HorzScaleItem>,
> = {
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
  onClick?: MouseEventHandler<HorzScaleItem>;
  /**
   * Callback function that is called when the crosshair moves.
   */
  onCrosshairMove?: MouseEventHandler<HorzScaleItem>;
  /**
   * Callback function that is called when the chart is initialized.
   */
  onInit?: (chart: TChartApi) => void; // TODO remove
  /**
   * Options for the chart.
   */
  options?: DeepPartial<TOptions>;
  /**
   * Callback function that is called when the chart is double-clicked.
   */
  onDblClick?: MouseEventHandler<HorzScaleItem>;
};

/**
 * Chart component props.
 */
export type ChartProps = GenericChartProps<Time, IChartApi, TimeChartOptions>;

/**
 * OptionsChart component props.
 */
export type OptionsChartProps = GenericChartProps<
  number,
  IChartApiBase<number>,
  PriceChartOptions
>;

/**
 * YieldCurveChart component props.
 */
export type YieldCurveChartProps = GenericChartProps<
  number,
  IYieldCurveChartApi,
  YieldCurveChartOptions
>;

/**
 * CustomChart component props.
 */
export type CustomChartProps<
  HorzScaleItem = Time,
  THorzScaleBehavior extends
    IHorzScaleBehavior<HorzScaleItem> = IHorzScaleBehavior<HorzScaleItem>,
> = GenericChartProps<
  HorzScaleItem,
  IChartApiBase<HorzScaleItem>,
  ReturnType<THorzScaleBehavior["options"]>
> & {
  /**
   * Horizontal scale behavior instance passed to `createChartEx`.
   */
  horzScaleBehavior: THorzScaleBehavior;
};

/**
 * Chart constructor signature.
 */
export type CreateChartApi<
  HorzScaleItem = Time,
  TChartApi extends ChartApiInstance<HorzScaleItem> = ChartApiInstance<HorzScaleItem>,
  TOptions extends ChartOptionsImpl<HorzScaleItem> = ChartOptionsImpl<HorzScaleItem>,
> = (container: HTMLElement, options?: DeepPartial<TOptions>) => TChartApi;

/**
 * Shared default chart options supported by all chart constructors.
 */
export type DefaultChartOptions = DeepPartial<ChartOptionsBase>;

/**
 * Chart API reference type that can be used to access the chart plugin API.
 */
export type ChartApiRef<
  HorzScaleItem = Time,
  TChartApi extends ChartApiInstance<HorzScaleItem> = ChartApiInstance<HorzScaleItem>,
> = {
  /**
   * Internal reference to the chart API instance.
   */
  _chart: TChartApi | null;
  /**
   * Function to get the chart API instance.
   */
  api: () => TChartApi | null;
  /**
   * Function to initialize the chart API instance.
   */
  init: () => TChartApi | null;
  /**
   * Function to clear the chart API instance.
   */
  clear: () => void;
};

/**
 * Chart context that provides access to the chart API and readiness state.
 */
export interface IChartContext<
  HorzScaleItem = Time,
  TChartApi extends ChartApiInstance<HorzScaleItem> = ChartApiInstance<HorzScaleItem>,
> {
  /**
   * Reference to the chart API.
   */
  chartApiRef: ChartApiRef<HorzScaleItem, TChartApi> | null;
  /**
   * Readiness state of the chart component.
   */
  isReady: boolean;
  /**
   * Runtime chart kind used for chart-specific guards.
   */
  chartKind: ChartKind;
}

/**
 * Chart component properties that can be used to create a chart.
 */
export type ChartComponentProps<
  HorzScaleItem = Time,
  TChartApi extends ChartApiInstance<HorzScaleItem> = ChartApiInstance<HorzScaleItem>,
  TOptions extends ChartOptionsImpl<HorzScaleItem> = ChartOptionsImpl<HorzScaleItem>,
> = {
  container: HTMLElement;
  /**
   * Runtime chart kind used for chart-specific guards.
   */
  chartKind?: ChartKind;
  /**
   * Chart constructor function.
   */
  createChartApi?: CreateChartApi<HorzScaleItem, TChartApi, TOptions>;
} & Omit<GenericChartProps<HorzScaleItem, TChartApi, TOptions>, "containerProps">;

/**
 * Options for the useChart hook.
 */
export type UseChartOptions<
  HorzScaleItem = Time,
  TChartApi extends ChartApiInstance<HorzScaleItem> = ChartApiInstance<HorzScaleItem>,
  TOptions extends ChartOptionsImpl<HorzScaleItem> = ChartOptionsImpl<HorzScaleItem>,
> = {
  container: HTMLElement;
  /**
   * Chart constructor function.
   */
  createChartApi?: CreateChartApi<HorzScaleItem, TChartApi, TOptions>;
} & Omit<
  GenericChartProps<HorzScaleItem, TChartApi, TOptions>,
  "children" | "containerProps"
>;
