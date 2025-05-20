import { useLayoutEffect, useRef } from "react";
import { useSafeContext } from "@/_shared/useSafeContext";
import { SeriesContext } from "@/series/SeriesContext";
import type { SeriesPrimitiveApiRef, SeriesPrimitiveProps } from "./types";

export const useSeriesPrimitive = ({ plugin }: SeriesPrimitiveProps) => {
  const { isReady: seriesIsReady, seriesApiRef: series } = useSafeContext(SeriesContext);

  const seriesPrimitiveApiRef = useRef<SeriesPrimitiveApiRef>({
    _primitive: null,
    api() {
      return this._primitive;
    },
    init() {
      if (!this._primitive) {
        const seriesApi = series?.api();

        if (!seriesApi) {
          return null;
        }

        seriesApi.attachPrimitive(plugin);
        this._primitive = plugin;
      }

      return this._primitive;
    },
    clear() {
      if (this._primitive !== null) {
        series?.api()?.detachPrimitive(this._primitive);
        this._primitive = null;
      }
    },
  });

  useLayoutEffect(() => {
    if (!seriesIsReady) return;

    seriesPrimitiveApiRef.current.init();
  }, [seriesIsReady]);

  useLayoutEffect(() => {
    return () => {
      seriesPrimitiveApiRef.current.clear();
    };
  }, []);

  return seriesPrimitiveApiRef;
};
