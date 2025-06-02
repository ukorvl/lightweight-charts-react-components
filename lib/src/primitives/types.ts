import type {
  IChartApi,
  ISeriesApi,
  ISeriesPrimitive,
  SeriesType,
} from "lightweight-charts";

export type SeriesPrimitiveApiRef = {
  _primitive: ISeriesPrimitive | null;
  api(): ISeriesPrimitive | null;
  init(): ISeriesPrimitive | null;
  clear(): void;
};

export type RenderPrimitive<T extends SeriesType = SeriesType> = ({
  chart,
  series,
}: {
  chart: IChartApi;
  series: ISeriesApi<T>;
}) => ISeriesPrimitive;

type SeriesPrimitivePropsWithRender<T extends SeriesType> = {
  render: RenderPrimitive<T>;
  plugin?: never;
};

type SeriesPrimitivePropsWithPlugin = {
  plugin: ISeriesPrimitive;
  render?: never;
};

export type SeriesPrimitiveProps<T extends SeriesType = SeriesType> =
  | SeriesPrimitivePropsWithRender<T>
  | SeriesPrimitivePropsWithPlugin;
