import type { ISeriesMarkersPluginApi, SeriesMarker, Time } from "lightweight-charts";

export type MarkersApiRef = {
  _markers: ISeriesMarkersPluginApi<Time> | null;
  api: () => ISeriesMarkersPluginApi<Time> | null;
  init: () => ISeriesMarkersPluginApi<Time> | null;
  clear: () => void;
};

export type MarkersProps = {
  markers: SeriesMarker<Time>[];
  reactive?: boolean;
};
