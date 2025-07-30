import type { ISeriesMarkersPluginApi, SeriesMarker, Time } from "lightweight-charts";

/**
 * Markers API reference type that can be used to access the series markers plugin API.
 */
export type MarkersApiRef = {
  /**
   * Internal reference to the series markers API instance.
   */
  _markers: ISeriesMarkersPluginApi<Time> | null;
  /**
   * Function to get the series markers API instance.
   */
  api: () => ISeriesMarkersPluginApi<Time> | null;
  /**
   * Function to initialize the series markers API instance.
   */
  init: () => ISeriesMarkersPluginApi<Time> | null;
  /**
   * Function to clear the series markers API instance.
   */
  clear: () => void;
};

/**
 * Markers component properties that can be used to create a series markers component.
 */
export type MarkersProps = {
  /**
   * List of markers to be displayed on the series.
   */
  markers: SeriesMarker<Time>[];
  /**
   * Options for the markers.
   */
  reactive?: boolean;
};
