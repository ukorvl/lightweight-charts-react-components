import { useLayoutEffect, useRef } from "react";
import { MarkersApiRef, MarkersProps } from "./types";
import { createSeriesMarkers } from "lightweight-charts";
import { useSafeContext } from "@/shared/useSafeContext";
import { SeriesContext } from "@/series/SeriesContext";

export const useInitMarkers = ({ reactive, markers }: MarkersProps) => {
  const series = useSafeContext(SeriesContext);

  const markersApiRef = useRef<MarkersApiRef>({
    _markers: null,
    api() {
      if (!this._markers && !this.destroyed) {
        const seriesApi = series.api();

        if (!seriesApi) {
          return null;
        }

        this._markers = createSeriesMarkers(seriesApi, []);
      }

      return this._markers;
    },
    clear() {
      if (this._markers !== null) {
        this._markers = null;
        this.destroyed = true;
      }
    },
    destroyed: false,
  });

  useLayoutEffect(() => {
    markersApiRef.current.api();

    return () => {
      markersApiRef.current.clear();
    };
  }, []);

  useLayoutEffect(() => {
    if (!series) return;

    if (markers && reactive) {
      markersApiRef.current.api()?.setMarkers(markers);
    }
  }, [markers, reactive]);

  return markersApiRef;
};
