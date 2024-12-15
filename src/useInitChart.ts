import { useLayoutEffect, useRef } from "react";
import { createChart } from "lightweight-charts";
import { ChartApiRef, ChartOptions } from "./types";
import { chartDefaultOptions } from "./chartDefaultOptions";

export const useInitChart = ({
  container,
  ...rest
}: {
  container: HTMLElement;
} & ChartOptions) => {
  const { onClick, onCrosshairMove, onInit, ...restOptions } = rest;

  const chartApiRef = useRef<ChartApiRef>({
    _chart: null,
    api() {
      if (this._chart === null && !this.destroyed) {
        this._chart = createChart(container, {
          ...chartDefaultOptions,
          ...restOptions,
        });

        if (onInit) {
          onInit(this._chart);
        }
      }

      return this._chart;
    },
    clear() {
      if (this._chart !== null) {
        this._chart.remove();
        this._chart = null;
        this.destroyed = true;
      }
    },
    destroyed: false,
  });

  useLayoutEffect(() => {
    chartApiRef.current.api();

    return () => {
      chartApiRef.current.clear();
    };
  }, []);

  useLayoutEffect(() => {
    if (!container) return;

    if (onClick) {
      chartApiRef.current.api()?.subscribeClick(onClick);
    }

    return () => {
      if (onClick) {
        chartApiRef.current.api()?.unsubscribeClick(onClick);
      }
    };
  }, [onClick]);

  useLayoutEffect(() => {
    if (!container) return;

    if (onCrosshairMove) {
      chartApiRef.current.api()?.subscribeCrosshairMove(onCrosshairMove);
    }

    return () => {
      if (onCrosshairMove) {
        chartApiRef.current.api()?.unsubscribeCrosshairMove(onCrosshairMove);
      }
    };
  }, [onCrosshairMove]);

  useLayoutEffect(() => {
    if (!container) return;

    chartApiRef.current.api()?.applyOptions(restOptions);
  }, [restOptions]);

  return chartApiRef;
};
