import type {
  IChartApiBase,
  IPaneApi,
  IPanePrimitive,
  ISeriesApi,
  ISeriesPrimitive,
  SeriesType,
  Time,
} from "lightweight-charts";

/**
 * Series primitive API reference type that can be used to access the series primitive plugin API.
 */
export type SeriesPrimitiveApiRef<HorzScaleItem = Time> = {
  /**
   * Internal reference to the series primitive API instance.
   */
  _primitive: ISeriesPrimitive<HorzScaleItem> | null;
  /**
   * Function to get the series primitive API instance.
   */
  api(): ISeriesPrimitive<HorzScaleItem> | null;
  /**
   * Function to initialize the series primitive API instance.
   */
  init(): ISeriesPrimitive<HorzScaleItem> | null;
  /**
   * Function to clear the series primitive API instance.
   */
  clear(): void;
};

/**
 * Render function type for series primitives.
 */
export type RenderPrimitive<T extends SeriesType = SeriesType, HorzScaleItem = Time> = ({
  chart,
  series,
}: {
  chart: IChartApiBase<HorzScaleItem>;
  series: ISeriesApi<T, HorzScaleItem>;
}) => ISeriesPrimitive<HorzScaleItem>;

/**
 * Pane primitive API reference type that can be used to access the pane primitive plugin API.
 */
export type PanePrimitiveApiRef<HorzScaleItem = Time> = {
  /**
   * Internal reference to the pane primitive API instance.
   */
  _primitive: IPanePrimitive<HorzScaleItem> | null;
  /**
   * Function to get the pane primitive API instance.
   */
  api(): IPanePrimitive<HorzScaleItem> | null;
  /**
   * Function to initialize the pane primitive API instance.
   */
  init(): IPanePrimitive<HorzScaleItem> | null;
  /**
   * Function to clear the pane primitive API instance.
   */
  clear(): void;
};

/**
 * Render function type for pane primitives.
 */
export type RenderPanePrimitive<HorzScaleItem = Time> = ({
  chart,
  pane,
}: {
  chart: IChartApiBase<HorzScaleItem>;
  pane: IPaneApi<HorzScaleItem>;
}) => IPanePrimitive<HorzScaleItem>;

type SeriesPrimitivePropsWithRender<T extends SeriesType, HorzScaleItem = Time> = {
  render: RenderPrimitive<T, HorzScaleItem>;
  plugin?: never;
};

type SeriesPrimitivePropsWithPlugin<HorzScaleItem = Time> = {
  plugin: ISeriesPrimitive<HorzScaleItem>;
  render?: never;
};

type PanePrimitivePropsWithRender<HorzScaleItem = Time> = {
  render: RenderPanePrimitive<HorzScaleItem>;
  plugin?: never;
};

type PanePrimitivePropsWithPlugin<HorzScaleItem = Time> = {
  plugin: IPanePrimitive<HorzScaleItem>;
  render?: never;
};

/**
 * Series primitive properties that can be used to create a series primitive.
 */
export type SeriesPrimitiveProps<
  T extends SeriesType = SeriesType,
  HorzScaleItem = Time,
> =
  | SeriesPrimitivePropsWithRender<T, HorzScaleItem>
  | SeriesPrimitivePropsWithPlugin<HorzScaleItem>;

/**
 * Pane primitive properties that can be used to create a pane primitive.
 */
export type PanePrimitiveProps<HorzScaleItem = Time> =
  | PanePrimitivePropsWithRender<HorzScaleItem>
  | PanePrimitivePropsWithPlugin<HorzScaleItem>;
