import {
  LineSeries,
  CandlestickSeries,
  HistogramSeries,
  AreaSeries,
  BaselineSeries,
  BarSeries,
} from "lightweight-charts";
import { useContext, useLayoutEffect, useRef, useState } from "react";
import { ChartContext } from "@/chart/ChartContext";
import { PaneContext } from "@/pane/PaneContext";
import { BaseInternalError } from "@/shared/InternalError";
import { useSafeContext } from "@/shared/useSafeContext";
import type {
  CustomSeriesUniqueProps,
  SeriesApiRef,
  SeriesTemplateProps,
  SeriesType,
} from "./types";
import type { SeriesDefinition, ISeriesApi } from "lightweight-charts";

type SeriesTypeWithoutCustom = Exclude<SeriesType, "Custom">;

export const useSeries = <T extends SeriesType>({
  type,
  data,
  options = {},
  reactive = true,
  ...rest
}: Omit<SeriesTemplateProps<T>, "children">) => {
  const { initialized: chartInitialized, chartApiRef: chart } =
    useSafeContext(ChartContext);
  const pane = useContext(PaneContext);
  const paneId = pane?.paneId;
  const [initialized, setInitialized] = useState(false);

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

        if (type === "Custom") {
          const plugin = (rest as CustomSeriesUniqueProps).plugin;
          if (!plugin) {
            throw new BaseInternalError("Custom series requires a plugin to be defined");
          }

          // TODO: Fix this type cast and infer the correct type
          (this._series as unknown as ISeriesApi<"Custom">) = chartApi.addCustomSeries(
            plugin,
            options,
            paneId
          );
        } else {
          this._series = chartApi.addSeries(
            seriesMap[type as SeriesTypeWithoutCustom] as SeriesDefinition<T>,
            options,
            paneId
          );
        }

        setInitialized(true);

        this._series?.setData(data);
      }

      return this._series;
    },
    clear() {
      if (this._series !== null) {
        chart?.api()?.removeSeries(this._series);
        this._series = null;
        setInitialized(false);
      }
    },
  });

  useLayoutEffect(() => {
    if (!chartInitialized) return;

    seriesApiRef.current.init();
  }, [chartInitialized]);

  useLayoutEffect(() => {
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

  return { initialized, seriesApiRef };
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
