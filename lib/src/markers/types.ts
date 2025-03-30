import { ISeriesMarkersPluginApi, SeriesMarker, Time } from "lightweight-charts";

export type MarkersApiRef = {
  _markers: ISeriesMarkersPluginApi<Time> | null;
  api: () => ISeriesMarkersPluginApi<Time> | null;
  clear: () => void;
  destroyed: boolean;
};

export type MarkersProps = {
  markers: SeriesMarker<Time>[];
  reactive?: boolean;
};
