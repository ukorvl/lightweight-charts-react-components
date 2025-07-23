import type { ISeriesMarkersPluginApi, SeriesMarker, Time } from "lightweight-charts";

/**
 * Markers API reference type that can be used to access the series markers plugin API.
 */
export type MarkersApiRef = {
  _markers: ISeriesMarkersPluginApi<Time> | null;
  api: () => ISeriesMarkersPluginApi<Time> | null;
  init: () => ISeriesMarkersPluginApi<Time> | null;
  clear: () => void;
};

/**
 * Markers component properties that can be used to create a series markers component.
 */
export type MarkersProps = {
  markers: SeriesMarker<Time>[];
  reactive?: boolean;
};
