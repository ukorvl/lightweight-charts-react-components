import type {
  DeepPartial,
  IPriceScaleApi,
  ITimeScaleApi,
  LogicalRangeChangeEventHandler,
  IRange,
  SizeChangeEventHandler,
  Time,
  TimeRangeChangeEventHandler,
  TimeScaleOptions as TimeScaleNativeOptions,
  PriceScaleOptions as PriceScaleNativeOptions,
} from "lightweight-charts";
import type { DependencyList, ReactNode } from "react";

type TimeScaleOptions = DeepPartial<TimeScaleNativeOptions>;
type PriceScaleOptions = DeepPartial<PriceScaleNativeOptions>;

/**
 * Time scale API reference type that can be used to access the time scale plugin API.
 */
export type TimeScaleApiRef = {
  _timeScale: ITimeScaleApi<Time> | null;
  api: () => ITimeScaleApi<Time> | null;
  init: () => ITimeScaleApi<Time> | null;
  clear: () => void;
};

/**
 * Price scale API reference type that can be used to access the price scale plugin API.
 */
export type PriceScaleApiRef = {
  _priceScale: IPriceScaleApi | null;
  api: () => IPriceScaleApi | null;
  init: () => IPriceScaleApi | null;
  setId: (id: string) => void;
  clear: () => void;
};

/**
 * TimeScale component props.
 */
export type TimeScaleProps = {
  onVisibleTimeRangeChange?: TimeRangeChangeEventHandler<Time>;
  onVisibleLogicalRangeChange?: LogicalRangeChangeEventHandler;
  onSizeChange?: SizeChangeEventHandler;
  visibleRange?: IRange<Time>;
  visibleLogicalRange?: IRange<number>;
  options?: TimeScaleOptions;
  children?: ReactNode;
};

/**
 * PriceScale component props.
 */
export type PriceScaleProps = {
  options?: PriceScaleOptions;
  id: string;
};

/**
 * TimeScaleFitContentTriggerProps component props.
 */
export type TimeScaleFitContentTriggerProps = {
  deps: DependencyList;
};

/**
 * TimeScaleContext that provides access to the time scale API and readiness state.
 */
export interface ITimeScaleContext {
  timeScaleApiRef: TimeScaleApiRef | null;
  isReady: boolean;
}
