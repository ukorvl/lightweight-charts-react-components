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
  /**
   * Internal reference to the series primitive API instance.
   */
  _primitive: ISeriesPrimitive | null;
  /**
   * Function to get the series primitive API instance.
   */
  api(): ISeriesPrimitive | null;
  /**
   * Function to initialize the series primitive API instance.
   */
  init(): ISeriesPrimitive | null;
  /**
   * Function to clear the series primitive API instance.
   */
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
