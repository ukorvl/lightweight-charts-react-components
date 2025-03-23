import type {
  ISeriesApi,
  SeriesType as NativeSeriesType,
  SeriesDataItemTypeMap,
  SeriesMarker,
  SeriesPartialOptionsMap,
  Time,
} from "lightweight-charts";
import { ReactNode } from "react";

export type SeriesType = Extract<NativeSeriesType, "Line" | "Candlestick" | "Histogram" | "Area">;

export type SeriesParameters<T extends SeriesType> = {
  data: SeriesDataItemTypeMap[T][];
  markers?: SeriesMarker<Time>[];
  reactive?: boolean;
  options?: SeriesOptions<T>;
};

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

export type SeriesOptions<T extends SeriesType> = SeriesPartialOptionsMap[T];

export type SeriesProps<T extends SeriesType> = Omit<SeriesTemplateProps<T>, "type">;
