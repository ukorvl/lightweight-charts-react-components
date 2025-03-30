/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  ICustomSeriesPaneView,
  ISeriesApi,
  SeriesDataItemTypeMap,
  SeriesPartialOptionsMap,
} from "lightweight-charts";
import { ReactNode } from "react";

export type SeriesType = keyof SeriesDataItemTypeMap;

type CustomSeriesParameters = {
  plugin: ICustomSeriesPaneView;
  data: any[];
  options?: SeriesOptions<"Custom"> & { [key: string]: any };
  reactive?: boolean;
};

type DefaultSeriesParameters<T extends SeriesType> = {
  data: SeriesDataItemTypeMap[T][];
  reactive?: boolean;
  options?: SeriesOptions<T>;
};

export type SeriesParameters<T extends SeriesType> = T extends "Custom"
  ? CustomSeriesParameters
  : DefaultSeriesParameters<T>;

export type SeriesTemplateProps<T extends SeriesType> = {
  type: T;
  children?: ReactNode;
} & SeriesParameters<T>;

export type SeriesApiRef<T extends SeriesType> = {
  _series: ISeriesApi<T> | null;
  api: () => ISeriesApi<T> | null;
  clear: () => void;
  destroyed: boolean;
};

export type SeriesOptions<T extends SeriesType> =
  SeriesPartialOptionsMap[T];

export type SeriesProps<T extends SeriesType> = Omit<
  SeriesTemplateProps<T>,
  "type"
>;
