import {
  type ChartOptions as TimeChartNativeOptions,
  type YieldCurveChartOptions as YieldCurveChartNativeOptions,
  type PriceChartOptions as PriceChartNativeOptions,
  type DeepPartial,
  type IChartApi,
  type MouseEventHandler,
  type Time,
} from "lightweight-charts";
import type { JSX, ReactNode } from "react";

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

type ChartCommonProps = {
  children?: ReactNode;
  containerProps?: JSX.IntrinsicElements["div"];
};

type TimeChartOwnProps = {
  onClick?: MouseEventHandler<Time>;
  onCrosshairMove?: MouseEventHandler<Time>;
  onDblClick?: MouseEventHandler<Time>;
  options?: DeepPartial<TimeChartNativeOptions>;
};

type YieldCurveChartProps = {
  onClick?: MouseEventHandler<number>;
  onCrosshairMove?: MouseEventHandler<number>;
  onDblClick?: MouseEventHandler<number>;
  options?: DeepPartial<YieldCurveChartNativeOptions>;
};

type OptionsChartOwnProps = {
  onClick?: MouseEventHandler<number>;
  onCrosshairMove?: MouseEventHandler<number>;
  onDblClick?: MouseEventHandler<number>;
  options?: DeepPartial<PriceChartNativeOptions>;
};

export type ChartOwnProps =
  | TimeChartOwnProps
  | YieldCurveChartProps
  | OptionsChartOwnProps;

export type ChartProps = ChartCommonProps & TimeChartOwnProps;
export type YieldCurveChartOwnProps = ChartCommonProps & YieldCurveChartProps;
export type OptionsChartProps = ChartCommonProps & OptionsChartOwnProps;

export type ChartComponentProps = {
  container: HTMLElement;
} & Omit<ChartProps, "containerProps">;

export type UseChartOptions<T extends ChartOwnProps> = {
  container: HTMLElement;
  createChartHandler: (
    container: string | HTMLElement,
    options?: DeepPartial<T["options"]>
  ) => IChartApi;
} & T;

// so the chart api for different charts is also diferent - different type
// can i handle it in 1 hook?
// need to explore here more
