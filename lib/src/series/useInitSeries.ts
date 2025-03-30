import { useLayoutEffect, useRef } from "react";
import { SeriesApiRef, SeriesTemplateProps, SeriesType } from "./types";
import {
  LineSeries,
  CandlestickSeries,
  HistogramSeries,
  AreaSeries,
  BaselineSeries,
  BarSeries,
  SeriesDefinition,
} from "lightweight-charts";
import { useSafeContext } from "@/shared/useSafeContext";
import { ChartContext } from "@/chart/ChartContext";
import { BaseInternalError } from "@/shared/InternalError";

type SeriesTypeWithoutCustom = Exclude<SeriesType, "Custom">;

export const useInitSeries = <T extends SeriesType>({
  type,
  data,
  options = {},
  reactive,
  plugin,
}: Omit<SeriesTemplateProps<T>, "children">) => {
  const chart = useSafeContext(ChartContext);

  const seriesApiRef = useRef<SeriesApiRef<T>>({
    _series: null,
    api() {
      if (!this._series && !this.destroyed) {
        const chartApi = chart.api();

        if (!chartApi) {
          return null;
        }

        if (!plugin && type === "Custom") {
          throw new BaseInternalError(
            "Custom series requires a plugin to be defined",
          );
        }

        this._series = chartApi.addSeries(
          type === "Custom"
            ? plugin
            : seriesMap[type as SeriesTypeWithoutCustom],
          options,
        );

        this._series.setData(data);
      }

      return this._series;
    },
    clear() {
      if (this._series !== null) {
        chart.api()?.removeSeries(this._series);
        this._series = null;
        this.destroyed = true;
      }
    },
    destroyed: false,
  });

  useLayoutEffect(() => {
    seriesApiRef.current.api();

    return () => {
      seriesApiRef.current.clear();
    };
  }, []);

  useLayoutEffect(() => {
    if (!chart) return;

    if (data && reactive) {
      seriesApiRef.current.api()?.setData(data);
    }
  }, [data, reactive]);

  useLayoutEffect(() => {
    if (!chart) return;

    if (options) {
      seriesApiRef.current.api()?.applyOptions(options);
    }
  }, [options]);

  return seriesApiRef;
};

const seriesMap: Record<
  SeriesTypeWithoutCustom,
  SeriesDefinition<SeriesTypeWithoutCustom>
> = {
  Line: LineSeries,
  Candlestick: CandlestickSeries,
  Histogram: HistogramSeries,
  Area: AreaSeries,
  Baseline: BaselineSeries,
  Bar: BarSeries,
};
