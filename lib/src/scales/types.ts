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

export type TimeScaleApiRef = {
  _timeScale: ITimeScaleApi<Time> | null;
  api: () => ITimeScaleApi<Time> | null;
  init: () => ITimeScaleApi<Time> | null;
  clear: () => void;
};

export type PriceScaleApiRef = {
  _priceScale: IPriceScaleApi | null;
  api: () => IPriceScaleApi | null;
  init: () => IPriceScaleApi | null;
  setId: (id: string) => void;
  clear: () => void;
};

export type TimeScaleProps = {
  onVisibleTimeRangeChange?: TimeRangeChangeEventHandler<Time>;
  onVisibleLogicalRangeChange?: LogicalRangeChangeEventHandler;
  onSizeChange?: SizeChangeEventHandler;
  visibleRange?: IRange<Time>;
  visibleLogicalRange?: IRange<number>;
  options?: TimeScaleOptions;
  children?: ReactNode;
};

export type PriceScaleProps = {
  options?: PriceScaleOptions;
  id: string;
};

export type TimeScaleFitContentTriggerProps = {
  deps: DependencyList;
};

export interface ITimeScaleContext {
  timeScaleApiRef: TimeScaleApiRef | null;
  isReady: boolean;
}
