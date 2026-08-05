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
  /**
   * Full data for this series.
   *
   * When `reactive` is `true` (the default), treat this prop as the source of truth for the
   * whole series. In other words, pass the complete array you want to see on the chart, not just
   * the last point.
   *
   * For performance, the wrapper will use `series.update()` only in the two safe cases below:
   * - you append exactly one new last item and every earlier item is the same object as before
   * - the array length stays the same, only the last item changes, and that last item has the same
   * `time` as before.
   *
   * In every other case, the wrapper calls `series.setData(data)` so the chart matches the new
   * array exactly. Which is slower but does not leave the stale data on the chart.
   *
   * Practical rule of thumb:
   * - if you want the fastest realtime updates, keep earlier items by reference and only replace or
   * append the last item
   * - if you replace history, refetch data, or build a fresh array from scratch, that is fine too;
   * the wrapper will fall back to `setData()` for correctness.
   *
   * If you want to skip the optimization and always replace the full dataset, use
   * `alwaysReplaceData`.
   */
  data: SeriesDataItemTypeMap<HorzScaleItem>[T][];
  /**
   * Whether the series should react to `data` prop changes.
   *
   * Defaults to `true`. Set this to `false` if you want to manage data updates imperatively
   * through the series API ref instead of syncing from React props.
   */
  reactive?: boolean;
  options?: SeriesOptions<T>;
  seriesOrder?: ReturnType<ISeriesApi<T>["seriesOrder"]>;
  /**
   * If true, the series will replace its data on every reactive update by calling `setData(data)`.
   *
   * If false, the wrapper follows the incremental update rules documented on `data` and uses
   * `update()` only for a safe last-bar replace or a pure append.
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
