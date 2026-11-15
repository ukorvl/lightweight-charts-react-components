import {
  LineSeries,
  CandlestickSeries,
  HistogramSeries,
  AreaSeries,
  BaselineSeries,
  BarSeries,
  type IChartApiBase,
  type IHorzScaleBehavior,
  type SeriesDataItemTypeMap,
  type Time,
} from "lightweight-charts";
import { useLayoutEffect, useRef, useState } from "react";
import { BaseInternalError } from "@/_shared/InternalError";
import { useLatestRef } from "@/_shared/useLatestRef";
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
  const dataRef = useLatestRef(data);
  const reactiveRef = useLatestRef(reactive);
  // The `data` prop the native series was last synced with. Reactive updates are diffed against
  // it instead of `seriesApi.data()`, which copies every point into new objects on each call.
  // `null` means the native data is unknown: no series yet, or `reactive` is off.
  const syncedDataRef = useRef<readonly SeriesDataPoint<T, HorzScaleItem>[] | null>(null);

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

        const initialData = dataRef.current;
        this._series?.setData(initialData);
        syncedDataRef.current = reactiveRef.current ? initialData : null;
        if (seriesOrder !== undefined) {
          this._series?.setSeriesOrder(seriesOrder);
        }
        setIsReady(true);
      }

      return this._series;
    },
    clear() {
      if (this._series !== null) {
        if (!chart?._isDisposing) {
          chart?.api()?.removeSeries(this._series);
        }
        this._series = null;
        syncedDataRef.current = null;
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
    if (!reactive) {
      // The series may now be updated imperatively, so its native data is no longer known.
      syncedDataRef.current = null;
      return;
    }

    const seriesApi = seriesApiRef.current.api();
    const chartApi = chart?.api();

    if (!data || !seriesApi || !chartApi) {
      return;
    }

    const syncedData = syncedDataRef.current;

    if (syncedData === data) {
      return;
    }

    syncedDataRef.current = data;

    const shouldReplaceData =
      alwaysReplaceData ||
      syncedData === null ||
      !canUseIncrementalUpdate(syncedData, data, chartApi.horzBehaviour()) ||
      !isPlainObject(data[data.length - 1]);

    if (shouldReplaceData) {
      seriesApi.setData(data);
      return;
    }

    // update() writes into the point it receives (it stores the original time and converts string
    // times), so it gets a copy: `data` belongs to React and can be frozen, for example by Immer.
    seriesApi.update({ ...data[data.length - 1] });
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
  nextData: readonly SeriesDataPoint<T, HorzScaleItem>[],
  horzBehavior: IHorzScaleBehavior<HorzScaleItem>
) => {
  const dataLengthDifference = nextData.length - currentData.length;

  if (
    currentData.length === 0 ||
    (dataLengthDifference !== 0 && dataLengthDifference !== 1)
  ) {
    return false;
  }

  // Times are compared with the chart's horizontal scale key, the same way the chart matches
  // points: a `yyyy-mm-dd` string and a BusinessDay for the same day are equal, and custom
  // horizontal scale items follow their own behavior.
  const currentLastKey = horzBehavior.key(currentData[currentData.length - 1].time);
  const nextLastKey = horzBehavior.key(nextData[nextData.length - 1].time);

  if (dataLengthDifference === 0) {
    return (
      currentLastKey === nextLastKey &&
      hasSameDataPointRefs(currentData, nextData, currentData.length - 1)
    );
  }

  return (
    nextLastKey > currentLastKey &&
    hasSameDataPointRefs(currentData, nextData, currentData.length)
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

// Only a plain object can be copied with a spread without losing what the chart reads from it:
// a class instance can plot from getters on its prototype.
const isPlainObject = (value: object) =>
  Object.getPrototypeOf(value) === Object.prototype;
