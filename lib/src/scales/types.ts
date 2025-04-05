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

export type TimeScaleOptions = DeepPartial<TimeScaleNativeOptions>;
export type PriceScaleOptions = DeepPartial<PriceScaleNativeOptions>;

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
};

export type PriceScaleProps = {
  options?: PriceScaleOptions;
  id: string;
};
