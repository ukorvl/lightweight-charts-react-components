import { useContext, useLayoutEffect, useRef } from "react";
import { SeriesApiRef, SeriesTemplateProps, SeriesType } from "./types";
import { ChartContext } from "../ChartContext";
import { getSeriesDefaultOptions } from "./seriesDefaultOptions";
import { IChartApi, ISeriesApi } from "lightweight-charts";

export const useInitSeries = <T extends SeriesType>({
  type,
  data,
  options,
  reactive,
  markers,
}: Omit<SeriesTemplateProps<T>, "children">) => {
  const chart = useContext(ChartContext);

  if (!chart) {
    throw new Error("Chart context not found");
  }

  const seriesApiRef = useRef<SeriesApiRef<T>>({
    _series: null,
    api() {
      if (!this._series && !this.destroyed) {
        const chartApi = chart.api();

        if (!chartApi) {
          return null;
        }

        this._series = addSeries(chartApi, type);

        this._series.applyOptions({
          ...getSeriesDefaultOptions(type),
          ...options,
        });

        this._series.setData(data);

        if (markers) {
          this._series.setMarkers(markers);
        }
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

    if (markers && reactive) {
      seriesApiRef.current.api()?.setMarkers(markers);
    }
  }, [markers, reactive]);

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

const addSeries = <T extends SeriesType>(chart: IChartApi, type: T) => {
  let series = null;

  switch (type) {
    case "Line":
      series = chart.addLineSeries();
      break;
    case "Candlestick":
      series = chart.addCandlestickSeries();
      break;
    case "Histogram":
      series = chart.addHistogramSeries();
      break;
    case "Area":
      series = chart.addAreaSeries();
      break;
    default:
      throw new Error(`Unknown series type: ${type}`);
  }

  return series as ISeriesApi<T>;
};
