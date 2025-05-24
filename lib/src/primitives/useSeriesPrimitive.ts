import { useLayoutEffect, useRef } from "react";
import { useSafeContext } from "@/_shared/useSafeContext";
import { ChartContext } from "@/chart/ChartContext";
import { SeriesContext } from "@/series/SeriesContext";
import type { SeriesPrimitiveApiRef, SeriesPrimitiveProps } from "./types";
import type { ISeriesApi, SeriesType } from "lightweight-charts";

export const useSeriesPrimitive = <T extends SeriesType>({
  render,
  plugin,
}: SeriesPrimitiveProps<T>) => {
  const { isReady: isChartReady, chartApiRef: chart } = useSafeContext(ChartContext);
  const { isReady: seriesIsReady, seriesApiRef: series } = useSafeContext(SeriesContext);

  const seriesPrimitiveApiRef = useRef<SeriesPrimitiveApiRef>({
    _primitive: null,
    api() {
      return this._primitive;
    },
    init() {
      if (!this._primitive) {
        const seriesApi = series?.api();
        const chartApi = chart?.api();

        if (!chartApi || !seriesApi) {
          return null;
        }

        const primitive = plugin
          ? plugin
          : render({
              chart: chartApi,
              series: seriesApi as ISeriesApi<T>,
            });

        seriesApi.attachPrimitive(primitive);
        this._primitive = primitive;
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
    if (!isChartReady || !seriesIsReady) return;

    seriesPrimitiveApiRef.current.init();
  }, [seriesIsReady, isChartReady]);

  useLayoutEffect(() => {
    return () => {
      seriesPrimitiveApiRef.current.clear();
    };
  }, []);

  return seriesPrimitiveApiRef;
};
