import {
  LineSeries,
  CandlestickSeries,
  HistogramSeries,
  AreaSeries,
  BaselineSeries,
  BarSeries,
  isBusinessDay,
  type BusinessDay,
  type IChartApiBase,
  type SeriesDataItemTypeMap,
  type Time,
} from "lightweight-charts";
import { useLayoutEffect, useRef, useState } from "react";
import { BaseInternalError } from "@/_shared/InternalError";
import { useSafeContext } from "@/_shared/useSafeContext";
import { ChartContext } from "@/chart/ChartContext";
import type { IChartContext } from "@/chart/types";
import { usePaneContext } from "@/pane/usePaneContext";
import type { CustomSeriesUniqueProps, SeriesApiRef, SeriesTemplateProps } from "./types";
import type { SeriesDefinition, ISeriesApi, SeriesType } from "lightweight-charts";

type SeriesTypeWithoutCustom = Exclude<SeriesType, "Custom">;
type SeriesDataPoint<
  T extends SeriesType,
  HorzScaleItem = Time,
> = SeriesDataItemTypeMap<HorzScaleItem>[T];

export const useSeries = <T extends SeriesType, HorzScaleItem = Time>({
  type,
  data,
  options = {},
  reactive = true,
  seriesOrder,
  alwaysReplaceData = false,
  ...rest
}: Omit<SeriesTemplateProps<T, HorzScaleItem>, "children">) => {
  const {
    isReady: chartIsReady,
    chartApiRef: chart,
    chartKind,
  } = useSafeContext(ChartContext) as IChartContext<
    HorzScaleItem,
    IChartApiBase<HorzScaleItem>
  >;
  const { isPaneReady, isInsidePane, paneApiRef } = usePaneContext<HorzScaleItem>();
  const [isReady, setIsReady] = useState(false);

  const seriesApiRef = useRef<SeriesApiRef<T, HorzScaleItem>>({
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
          const plugin = (rest as CustomSeriesUniqueProps<HorzScaleItem>).plugin;
          if (!plugin) {
            // TODO: Link this error to docs covering custom series plugin requirements.
            throw new BaseInternalError("Custom series requires a plugin to be defined");
          }

          // TODO: Fix this type cast and infer the correct type
          (this._series as unknown as ISeriesApi<"Custom", HorzScaleItem>) =
            chartApi.addCustomSeries(plugin, options, paneIndex);
        } else {
          if (chartKind === "yield-curve" && type !== "Area" && type !== "Line") {
            // TODO: Link this error to docs covering YieldCurveChart series constraints.
            throw new BaseInternalError(
              "YieldCurveChart only supports LineSeries and AreaSeries.",
              {
                isOperational: true,
              }
            );
          }

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
      const shouldReplaceData =
        alwaysReplaceData || !canUseIncrementalUpdate(currentData, data);

      if (shouldReplaceData) {
        seriesApi.setData(data);
        return;
      }

      const lastDataPoint = data[data.length - 1];
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

const canUseIncrementalUpdate = <T extends SeriesType, HorzScaleItem = Time>(
  currentData: readonly SeriesDataPoint<T, HorzScaleItem>[],
  nextData: readonly SeriesDataPoint<T, HorzScaleItem>[]
) => {
  const dataLengthDifference = nextData.length - currentData.length;

  if (
    currentData.length === 0 ||
    nextData.length === 0 ||
    dataLengthDifference < 0 ||
    dataLengthDifference > 1
  ) {
    return false;
  }

  if (dataLengthDifference === 0) {
    return (
      hasSameDataPointRefs(currentData, nextData, currentData.length - 1) &&
      hasSameDataPointTime(
        currentData[currentData.length - 1],
        nextData[nextData.length - 1]
      )
    );
  }

  return (
    hasSameDataPointRefs(currentData, nextData, currentData.length) &&
    !hasSameDataPointTime(
      currentData[currentData.length - 1],
      nextData[nextData.length - 1]
    )
  );
};

const hasSameDataPointRefs = <TData>(
  currentData: readonly TData[],
  nextData: readonly TData[],
  length: number
) => {
  for (let index = 0; index < length; index += 1) {
    if (currentData[index] !== nextData[index]) {
      return false;
    }
  }

  return true;
};

const hasSameDataPointTime = <TData extends { time: unknown }>(
  currentDataPoint: TData,
  nextDataPoint: TData
) => {
  const currentTime = currentDataPoint.time;
  const nextTime = nextDataPoint.time;

  return (
    currentTime === nextTime ||
    (isBusinessDayTime(currentTime) &&
      isBusinessDayTime(nextTime) &&
      isSameBusinessDay(currentTime, nextTime))
  );
};

const isBusinessDayTime = (time: unknown): time is BusinessDay =>
  isBusinessDay(time as Time);

const isSameBusinessDay = (
  currentBusinessDay: BusinessDay,
  nextBusinessDay: BusinessDay
) =>
  currentBusinessDay.year === nextBusinessDay.year &&
  currentBusinessDay.month === nextBusinessDay.month &&
  currentBusinessDay.day === nextBusinessDay.day;
