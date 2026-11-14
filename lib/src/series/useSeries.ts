import {
  LineSeries,
  CandlestickSeries,
  HistogramSeries,
  AreaSeries,
  BaselineSeries,
  BarSeries,
  type BusinessDay,
  type IChartApiBase,
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

    if (!data || !seriesApi) {
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
      !canUseIncrementalUpdate(syncedData, data);

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

  const lastPointHasSameTime = hasSameTime(
    currentData[currentData.length - 1].time,
    nextData[nextData.length - 1].time
  );

  if (lastPointHasSameTime === null) {
    return false;
  }

  if (dataLengthDifference === 0) {
    return (
      lastPointHasSameTime &&
      hasSameDataPointRefs(currentData, nextData, currentData.length - 1)
    );
  }

  return (
    !lastPointHasSameTime &&
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

// Compares two data point times. Returns `null` when they cannot be compared, for example custom
// horizontal scale items, so the caller falls back to `setData()`.
const hasSameTime = (currentTime: unknown, nextTime: unknown): boolean | null => {
  if (currentTime === nextTime) {
    return true;
  }

  const currentTimeKey = getTimeKey(currentTime);
  const nextTimeKey = getTimeKey(nextTime);

  if (currentTimeKey === null || nextTimeKey === null) {
    return null;
  }

  return currentTimeKey === nextTimeKey;
};

const BUSINESS_DAY_STRING_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

// A day can be given as a `yyyy-mm-dd` string or as a BusinessDay object, for example history as
// BusinessDay objects and live points as strings, so both forms map to the same key.
const getTimeKey = (time: unknown): number | string | null => {
  if (typeof time === "number") {
    return time;
  }

  if (typeof time === "string") {
    const match = BUSINESS_DAY_STRING_PATTERN.exec(time);

    return match
      ? toBusinessDayKey(Number(match[1]), Number(match[2]), Number(match[3]))
      : null;
  }

  if (isBusinessDay(time)) {
    return toBusinessDayKey(time.year, time.month, time.day);
  }

  return null;
};

const toBusinessDayKey = (year: number, month: number, day: number) =>
  `${year}-${month}-${day}`;

const isBusinessDay = (time: unknown): time is BusinessDay =>
  typeof time === "object" &&
  time !== null &&
  typeof (time as BusinessDay).year === "number" &&
  typeof (time as BusinessDay).month === "number" &&
  typeof (time as BusinessDay).day === "number";
