import type {
  ICustomSeriesPaneView,
  ISeriesApi,
  SeriesDataItemTypeMap,
  SeriesPartialOptionsMap,
  SeriesType,
} from "lightweight-charts";
import type { ReactNode } from "react";

/**
 * Unique properties for the custom series component.
 */
export type CustomSeriesUniqueProps = {
  /**
   * Custom pane view plugin instance that can be used to render custom series.
   */
  plugin?: ICustomSeriesPaneView;
};

type SeriesParameters<T extends SeriesType> = {
  data: SeriesDataItemTypeMap[T][];
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
} & (T extends "Custom" ? CustomSeriesUniqueProps : {});

/**
 * Properties of a series template component that can be used to create a series of a specific type.
 */
export type SeriesTemplateProps<T extends SeriesType> = {
  type: T;
  children?: ReactNode;
} & SeriesParameters<T>;

/**
 * Series API reference type that can be used to access the series plugin API.
 */
export type SeriesApiRef<T extends SeriesType> = {
  /**
   * Internal reference to the series API instance.
   */
  _series: ISeriesApi<T> | null;
  /**
   * Function to get the series API instance.
   */
  api: () => ISeriesApi<T> | null;
  /**
   * Function to initialize the series API instance.
   */
  init: () => ISeriesApi<T> | null;
  /**
   * Function to clear the series API instance.
   */
  clear: () => void;
};

/**
 * Context for the series component that provides access to the series API and readiness state.
 */
export interface ISeriesContext {
  /**
   * Reference to the series API.
   */
  seriesApiRef: SeriesApiRef<SeriesType> | null;
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
export type SeriesProps<T extends SeriesType> = Omit<SeriesTemplateProps<T>, "type">;
