import type {
  IChartApi,
  ISeriesApi,
  ISeriesPrimitive,
  SeriesType,
} from "lightweight-charts";

/**
 * Series primitive API reference type that can be used to access the series primitive plugin API.
 */
export type SeriesPrimitiveApiRef = {
  _primitive: ISeriesPrimitive | null;
  api(): ISeriesPrimitive | null;
  init(): ISeriesPrimitive | null;
  clear(): void;
};

/**
 * Render function type for series primitives.
 */
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

/**
 * Series primitive properties that can be used to create a series primitive.
 */
export type SeriesPrimitiveProps<T extends SeriesType = SeriesType> =
  | SeriesPrimitivePropsWithRender<T>
  | SeriesPrimitivePropsWithPlugin;
