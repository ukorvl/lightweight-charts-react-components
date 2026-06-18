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
 * Shared API reference shape for reactive primitives.
 */
type ReactivePrimitiveApiRef<TPrimitive> = {
  /**
   * Internal reference to the primitive API instance.
   */
  _primitive: TPrimitive | null;
  /**
   * Function to get the primitive API instance.
   */
  api(): TPrimitive | null;
  /**
   * Function to initialize the primitive API instance.
   */
  init(): TPrimitive | null;
  /**
   * Function to clear the primitive API instance.
   */
  clear(): void;
};

type ReactivePrimitiveProps<TPrimitive, TRender> =
  | {
      render: TRender;
      plugin?: never;
    }
  | {
      plugin: TPrimitive;
      render?: never;
    };

/**
 * Series primitive API reference type that can be used to access the series primitive plugin API.
 */
export type SeriesPrimitiveApiRef<HorzScaleItem = Time> = ReactivePrimitiveApiRef<
  ISeriesPrimitive<HorzScaleItem>
>;

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
export type PanePrimitiveApiRef<HorzScaleItem = Time> = ReactivePrimitiveApiRef<
  IPanePrimitive<HorzScaleItem>
>;

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

/**
 * Series primitive properties that can be used to create a series primitive.
 */
export type SeriesPrimitiveProps<
  T extends SeriesType = SeriesType,
  HorzScaleItem = Time,
> = ReactivePrimitiveProps<
  ISeriesPrimitive<HorzScaleItem>,
  RenderPrimitive<T, HorzScaleItem>
>;

/**
 * Pane primitive properties that can be used to create a pane primitive.
 */
export type PanePrimitiveProps<HorzScaleItem = Time> = ReactivePrimitiveProps<
  IPanePrimitive<HorzScaleItem>,
  RenderPanePrimitive<HorzScaleItem>
>;
