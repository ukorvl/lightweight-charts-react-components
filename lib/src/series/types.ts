import type {
  ICustomSeriesPaneView,
  ISeriesApi,
  SeriesDataItemTypeMap,
  SeriesPartialOptionsMap,
  SeriesType,
  Time,
} from "lightweight-charts";
import type { ReactElement, ReactNode, RefAttributes } from "react";

/**
 * Unique properties for the custom series component.
 */
export type CustomSeriesUniqueProps<HorzScaleItem = Time> = {
  /**
   * Custom pane view plugin instance that can be used to render custom series.
   */
  plugin?: ICustomSeriesPaneView<HorzScaleItem>;
};

type SeriesParameters<T extends SeriesType, HorzScaleItem = Time> = {
  data: SeriesDataItemTypeMap<HorzScaleItem>[T][];
  reactive?: boolean;
  options?: SeriesOptions<T>;
  seriesOrder?: ReturnType<ISeriesApi<T>["seriesOrder"]>;
  /**
   * If true, the series will replace its data on every update.
   * If false, it will try to append data to the existing series, that can be useful for performance.
   *
   * @see {@link https://tradingview.github.io/lightweight-charts/docs#updating-the-data-in-a-series | TradingView documentation for updating series data}
   */
  alwaysReplaceData?: boolean;
} & (T extends "Custom" ? CustomSeriesUniqueProps<HorzScaleItem> : {});

/**
 * Properties of a series template component that can be used to create a series of a specific type.
 */
export type SeriesTemplateProps<T extends SeriesType, HorzScaleItem = Time> = {
  type: T;
  children?: ReactNode;
} & SeriesParameters<T, HorzScaleItem>;

/**
 * Series API reference type that can be used to access the series plugin API.
 */
export type SeriesApiRef<T extends SeriesType, HorzScaleItem = Time> = {
  /**
   * Internal reference to the series API instance.
   */
  _series: ISeriesApi<T, HorzScaleItem> | null;
  /**
   * Function to get the series API instance.
   */
  api: () => ISeriesApi<T, HorzScaleItem> | null;
  /**
   * Function to initialize the series API instance.
   */
  init: () => ISeriesApi<T, HorzScaleItem> | null;
  /**
   * Function to clear the series API instance.
   */
  clear: () => void;
};

/**
 * Context for the series component that provides access to the series API and readiness state.
 */
export interface ISeriesContext<HorzScaleItem = Time> {
  /**
   * Reference to the series API.
   */
  seriesApiRef: SeriesApiRef<SeriesType, HorzScaleItem> | null;
  /**
   * Readiness state of the series component.
   */
  isReady: boolean;
}

/**
 * Series options that can be used to customize the appearance and behavior of a series.
 */
export type SeriesOptions<T extends SeriesType> = SeriesPartialOptionsMap[T];

/**
 * Series component properties that can be used to create a series of a specific type.
 */
export type SeriesProps<T extends SeriesType, HorzScaleItem = Time> = Omit<
  SeriesTemplateProps<T, HorzScaleItem>,
  "type"
>;

/**
 * Forward ref component type for a series component.
 */
export type SeriesForwardRefComponent<T extends SeriesType> = (<HorzScaleItem = Time>(
  props: SeriesProps<T, HorzScaleItem> & RefAttributes<SeriesApiRef<T, HorzScaleItem>>
) => ReactElement | null) & {
  displayName?: string;
};
