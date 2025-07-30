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
  /**
   * Reference to the time scale API.
   */
  _timeScale: ITimeScaleApi<Time> | null;
  /**
   * Function to get the time scale API.
   */
  api: () => ITimeScaleApi<Time> | null;
  /**
   * Function to initialize the time scale API.
   */
  init: () => ITimeScaleApi<Time> | null;
  /**
   * Function to clear the time scale API.
   */
  clear: () => void;
};

/**
 * Price scale API reference type that can be used to access the price scale plugin API.
 */
export type PriceScaleApiRef = {
  /**
   * Reference to the price scale API.
   */
  _priceScale: IPriceScaleApi | null;
  /**
   * Function to get the price scale API.
   */
  api: () => IPriceScaleApi | null;
  /**
   * Function to initialize the price scale API.
   */
  init: () => IPriceScaleApi | null;
  /**
   * Function to set the ID of the price scale.
   */
  setId: (id: string) => void;
  /**
   * Function to clear the price scale API.
   */
  clear: () => void;
};

/**
 * TimeScale component props.
 */
export type TimeScaleProps = {
  /**
   * Callback for when the visible time range changes.
   */
  onVisibleTimeRangeChange?: TimeRangeChangeEventHandler<Time>;
  /**
   * Callback for when the visible logical range changes.
   */
  onVisibleLogicalRangeChange?: LogicalRangeChangeEventHandler;
  /**
   * Callback for when the size of the time scale changes.
   */
  onSizeChange?: SizeChangeEventHandler;
  /**
   * The visible time range for the time scale.
   */
  visibleRange?: IRange<Time>;
  /**
   * The visible logical range for the time scale.
   */
  visibleLogicalRange?: IRange<number>;
  /**
   * Options for the time scale.
   */
  options?: TimeScaleOptions;
  /**
   * Children of the time scale component.
   */
  children?: ReactNode;
};

/**
 * PriceScale component props.
 */
export type PriceScaleProps = {
  /**
   * Options for the price scale.
   */
  options?: PriceScaleOptions;
  /**
   * The ID of the price scale.
   */
  id: string;
};

/**
 * TimeScaleFitContentTriggerProps component props.
 */
export type TimeScaleFitContentTriggerProps = {
  /**
   * List of dependencies that trigger the time scale to fit content.
   */
  deps: DependencyList;
};

/**
 * TimeScaleContext that provides access to the time scale API and readiness state.
 */
export interface ITimeScaleContext {
  /**
   * Reference to the time scale API.
   */
  timeScaleApiRef: TimeScaleApiRef | null;
  /**
   * Readiness state of the time scale component.
   */
  isReady: boolean;
}
