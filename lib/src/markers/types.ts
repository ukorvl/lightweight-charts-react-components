import type {
  DeepPartial,
  ISeriesMarkersPluginApi,
  SeriesMarker,
  SeriesMarkersOptions,
  Time,
} from "lightweight-charts";

/**
 * Markers API reference type that can be used to access the series markers plugin API.
 */
export type MarkersApiRef<HorzScaleItem = Time> = {
  /**
   * Internal reference to the series markers API instance.
   */
  _markers: ISeriesMarkersPluginApi<HorzScaleItem> | null;
  /**
   * Function to get the series markers API instance.
   */
  api: () => ISeriesMarkersPluginApi<HorzScaleItem> | null;
  /**
   * Function to initialize the series markers API instance.
   */
  init: () => ISeriesMarkersPluginApi<HorzScaleItem> | null;
  /**
   * Function to clear the series markers API instance.
   */
  clear: () => void;
};

/**
 * Markers component properties that can be used to create a series markers component.
 */
export type MarkersProps<HorzScaleItem = Time> = {
  /**
   * List of markers to be displayed on the series.
   */
  markers: SeriesMarker<HorzScaleItem>[];
  /**
   * Options for the markers. Changes are applied to the existing plugin regardless of `reactive`.
   */
  options?: DeepPartial<SeriesMarkersOptions>;
  /**
   * Whether the marker list should update reactively. Defaults to true. Does not affect options updates.
   */
  reactive?: boolean;
};
