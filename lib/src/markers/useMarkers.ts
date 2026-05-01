import { createSeriesMarkers } from "lightweight-charts";
import { useLayoutEffect, useRef } from "react";
import { useSafeContext } from "@/_shared/useSafeContext";
import { SeriesContext } from "@/series/SeriesContext";
import type { ISeriesContext } from "@/series/types";
import type { MarkersApiRef, MarkersProps } from "./types";
import type { Time } from "lightweight-charts";

export const useMarkers = <HorzScaleItem = Time>({
  reactive = true,
  markers,
  options,
}: MarkersProps<HorzScaleItem>) => {
  const { isReady: seriesIsReady, seriesApiRef: series } = useSafeContext(
    SeriesContext
  ) as ISeriesContext<HorzScaleItem>;

  const markersApiRef = useRef<MarkersApiRef<HorzScaleItem>>({
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

        this._markers = createSeriesMarkers(seriesApi, markers, options);
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
