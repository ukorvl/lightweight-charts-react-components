import type {
  ICustomSeriesPaneView,
  ISeriesApi,
  SeriesDataItemTypeMap,
  SeriesPartialOptionsMap,
  SeriesType,
  Time,
} from "lightweight-charts";
import type { ReactNode } from "react";

export type CustomSeriesUniqueProps = {
  plugin?: ICustomSeriesPaneView;
};

/**
 * Represents crosshair position within a series.
 * Includes the price at the crosshair position and the horizontal of the crosshair.
 */
export type CrosshairPosition = {
  price: number;
  horizontalPosition: Time;
};

type SeriesParameters<T extends SeriesType> = {
  data: SeriesDataItemTypeMap[T][];
  reactive?: boolean;
  options?: SeriesOptions<T>;
  isPane?: boolean;
  /**
   * Allows to programmatically set the crosshair position within the series.
   * This is useful for syncing crosshairs across multiple charts.
   *
   * @example
   * ```tsx
   * <Series
   *   type="Line"
   *   data={data}
   *   crosshairPosition={{ price: 100, horizontalPosition: 1622548800000 }}
   * />
   * ```
   */
  crosshairPosition?: CrosshairPosition | null;
} & (T extends "Custom" ? CustomSeriesUniqueProps : {});

export type SeriesTemplateProps<T extends SeriesType> = {
  type: T;
  children?: ReactNode;
} & SeriesParameters<T>;

export type SeriesApiRef<T extends SeriesType> = {
  _series: ISeriesApi<T> | null;
  api: () => ISeriesApi<T> | null;
  init: () => ISeriesApi<T> | null;
  clear: () => void;
};

export interface ISeriesContext {
  seriesApiRef: SeriesApiRef<SeriesType> | null;
  isReady: boolean;
}

export type SeriesOptions<T extends SeriesType> = SeriesPartialOptionsMap[T];

export type SeriesProps<T extends SeriesType> = Omit<SeriesTemplateProps<T>, "type">;
