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
  plugin?: ICustomSeriesPaneView;
};

type SeriesParameters<T extends SeriesType> = {
  data: SeriesDataItemTypeMap[T][];
  reactive?: boolean;
  options?: SeriesOptions<T>;
  seriesOrder?: ReturnType<ISeriesApi<T>["seriesOrder"]>;
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
  _series: ISeriesApi<T> | null;
  api: () => ISeriesApi<T> | null;
  init: () => ISeriesApi<T> | null;
  clear: () => void;
};

/**
 * Context for the series component that provides access to the series API and readiness state.
 */
export interface ISeriesContext {
  seriesApiRef: SeriesApiRef<SeriesType> | null;
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
