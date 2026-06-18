import { useRef } from "react";
import { useSafeContext } from "@/_shared/useSafeContext";
import { ChartContext } from "@/chart/ChartContext";
import type { IChartContext } from "@/chart/types";
import { SeriesContext } from "@/series/SeriesContext";
import type { ISeriesContext } from "@/series/types";
import { useReactivePrimitive } from "./useReactivePrimitive";
import type { SeriesPrimitiveApiRef, SeriesPrimitiveProps } from "./types";
import type { IChartApiBase, SeriesType, Time } from "lightweight-charts";
import type { ISeriesApi } from "lightweight-charts";
import type { RefObject } from "react";

export const useSeriesPrimitive = <T extends SeriesType, HorzScaleItem = Time>(
  props: SeriesPrimitiveProps<T, HorzScaleItem>
): RefObject<SeriesPrimitiveApiRef<HorzScaleItem>> => {
  const { isReady: isChartReady, chartApiRef: chart } = useSafeContext(
    ChartContext
  ) as IChartContext<HorzScaleItem, IChartApiBase<HorzScaleItem>>;
  const { isReady: seriesIsReady, seriesApiRef: series } = useSafeContext(
    SeriesContext
  ) as ISeriesContext<HorzScaleItem>;
  const chartApiRef = useRef(chart);
  const seriesApiRef = useRef(series);

  chartApiRef.current = chart;
  seriesApiRef.current = series;
  const seriesPrimitiveApiRef = useReactivePrimitive({
    isReady: isChartReady && seriesIsReady,
    props,
    primitiveIdentity: props.plugin ?? props.render,
    mountPrimitive(currentProps) {
      const seriesApi = seriesApiRef.current?.api();
      const chartApi = chartApiRef.current?.api();

      if (!chartApi || !seriesApi) {
        return null;
      }

      const primitive =
        currentProps.plugin !== undefined
          ? currentProps.plugin
          : currentProps.render({
              chart: chartApi,
              series: seriesApi as ISeriesApi<T, HorzScaleItem>,
            });

      seriesApi.attachPrimitive(primitive);

      return {
        primitive,
        detach: () => seriesApi.detachPrimitive(primitive),
      };
    },
  });

  return seriesPrimitiveApiRef;
};
