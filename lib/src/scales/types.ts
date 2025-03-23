import type {
  DeepPartial,
  IPriceScaleApi,
  ITimeScaleApi,
  LogicalRangeChangeEventHandler,
  Range,
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
  clear: () => void;
};

export type PriceScaleApiRef = {
  _priceScale: IPriceScaleApi | null;
  api: () => IPriceScaleApi | null;
  setId: (id: string) => void;
  clear: () => void;
};

export type TimeScaleProps = {
  onVisibleTimeRangeChange?: TimeRangeChangeEventHandler<Time>;
  onVisibleLogicalRangeChange?: LogicalRangeChangeEventHandler;
  onSizeChange?: SizeChangeEventHandler;
  visibleRange?: Range<Time>;
  visibleLogicalRange?: Range<number>;
  options?: TimeScaleOptions;
};

export type PriceScaleProps = {
  options?: PriceScaleOptions;
  id: string;
};
