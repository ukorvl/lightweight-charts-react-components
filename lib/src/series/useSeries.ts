import {
  LineSeries,
  CandlestickSeries,
  HistogramSeries,
  AreaSeries,
  BaselineSeries,
  BarSeries,
} from "lightweight-charts";
import { useLayoutEffect, useRef, useState } from "react";
import { BaseInternalError } from "@/_shared/InternalError";
import { useSafeContext } from "@/_shared/useSafeContext";
import { ChartContext } from "@/chart/ChartContext";
import { usePaneContext } from "@/pane/usePaneContext";
import type { CustomSeriesUniqueProps, SeriesApiRef, SeriesTemplateProps } from "./types";
import type { SeriesDefinition, ISeriesApi, SeriesType } from "lightweight-charts";

type SeriesTypeWithoutCustom = Exclude<SeriesType, "Custom">;

export const useSeries = <T extends SeriesType>({
  type,
  data,
  options = {},
  reactive = true,
  seriesOrder,
  alwaysReplaceData = false,
  ...rest
}: Omit<SeriesTemplateProps<T>, "children">) => {
  const { isReady: chartIsReady, chartApiRef: chart } = useSafeContext(ChartContext);
  const { isPaneReady, isInsidePane, paneApiRef } = usePaneContext();
  const [isReady, setIsReady] = useState(false);

  const seriesApiRef = useRef<SeriesApiRef<T>>({
    _series: null,
    api() {
      return this._series;
    },
    init() {
      if (!this._series) {
        const chartApi = chart?.api();

        if (!chartApi) {
          return null;
        }

        const paneIndex = isInsidePane ? paneApiRef?.api()?.paneIndex() : undefined;

        if (type === "Custom") {
          const plugin = (rest as CustomSeriesUniqueProps).plugin;
          if (!plugin) {
            throw new BaseInternalError("Custom series requires a plugin to be defined");
          }

          // TODO: Fix this type cast and infer the correct type
          (this._series as unknown as ISeriesApi<"Custom">) = chartApi.addCustomSeries(
            plugin,
            options,
            paneIndex
          );
        } else {
          this._series = chartApi.addSeries(
            seriesMap[type as SeriesTypeWithoutCustom] as SeriesDefinition<T>,
            options,
            paneIndex
          );
        }

        this._series?.setData(data);
        if (seriesOrder !== undefined) {
          this._series?.setSeriesOrder(seriesOrder);
        }
        setIsReady(true);
      }

      return this._series;
    },
    clear() {
      if (this._series !== null) {
        chart?.api()?.removeSeries(this._series);
        this._series = null;
        setIsReady(false);
      }
    },
  });

  useLayoutEffect(() => {
    if (!chartIsReady) return;

    if (isInsidePane && !isPaneReady) {
      return;
    }

    seriesApiRef.current.init();
  }, [chartIsReady, isInsidePane, isPaneReady]);

  useLayoutEffect(() => {
    return () => {
      seriesApiRef.current.clear();
    };
  }, []);

  useLayoutEffect(() => {
    if (!chart) return;

    if (data && reactive) {
      const seriesApi = seriesApiRef.current.api();

      if (!seriesApi) {
        return;
      }

      const currentData = seriesApi.data();
      const dataLengthDifference = data.length - currentData.length;
      const maxIncrementalUpdateThreshold = 1;
      const shouldReplaceData =
        alwaysReplaceData ||
        currentData.length === 0 ||
        data.length === 0 ||
        dataLengthDifference < 0 ||
        dataLengthDifference > maxIncrementalUpdateThreshold;

      if (shouldReplaceData) {
        seriesApi.setData(data);
        return;
      }

      const lastDataPoint = { ...data[data.length - 1] };
      seriesApi.update(lastDataPoint);
    }
  }, [data, reactive, alwaysReplaceData]);

  useLayoutEffect(() => {
    if (!chart) return;

    if (options) {
      seriesApiRef.current.api()?.applyOptions(options);
    }
  }, [options]);

  useLayoutEffect(() => {
    if (!chart) return;

    if (seriesOrder !== undefined) {
      seriesApiRef.current.api()?.setSeriesOrder(seriesOrder);
    }
  }, [seriesOrder]);

  return { isReady, seriesApiRef };
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
