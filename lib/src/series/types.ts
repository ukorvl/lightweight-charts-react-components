import type {
  ICustomSeriesPaneView,
  ISeriesApi,
  SeriesDataItemTypeMap,
  SeriesPartialOptionsMap,
} from "lightweight-charts";
import type { ReactNode } from "react";

export type SeriesType = keyof SeriesDataItemTypeMap;

export type CustomSeriesUniqueProps = {
  plugin?: ICustomSeriesPaneView;
};

type SeriesParameters<T extends SeriesType> = {
  data: SeriesDataItemTypeMap[T][];
  reactive?: boolean;
  options?: SeriesOptions<T>;
  isPane?: boolean;
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
