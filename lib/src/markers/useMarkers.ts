import { createSeriesMarkers } from "lightweight-charts";
import { useLayoutEffect, useRef } from "react";
import { SeriesContext } from "@/series/SeriesContext";
import { useSafeContext } from "@/shared/useSafeContext";
import type { MarkersApiRef, MarkersProps } from "./types";

export const useMarkers = ({ reactive = true, markers }: MarkersProps) => {
  const { isReady: seriesIsReady, seriesApiRef: series } = useSafeContext(SeriesContext);

  const markersApiRef = useRef<MarkersApiRef>({
    _markers: null,
    api() {
      return this._markers;
    },
    init() {
      if (this._markers === null) {
        const seriesApi = series?.api();

        if (!seriesApi) {
          return null;
        }

        this._markers = createSeriesMarkers(seriesApi, markers);
      }

      return this._markers;
    },
    clear() {
      if (this._markers !== null) {
        this._markers.detach();
        this._markers = null;
      }
    },
  });

  useLayoutEffect(() => {
    if (!seriesIsReady) return;

    markersApiRef.current.init();
  }, [seriesIsReady]);

  useLayoutEffect(() => {
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
