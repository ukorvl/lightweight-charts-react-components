/* eslint-disable */
import { useLayoutEffect, useRef, useState } from "react";
import type { ChartApiRef, ChartOwnProps, UseChartOptions } from "./types";
import { defaultChartOptions } from "./defaultChartOptions";
import { createChart } from "lightweight-charts";

export const useChart = <T extends ChartOwnProps>({
  container,
  onClick,
  onCrosshairMove,
  options = {},
  onDblClick,
  createChartHandler,
}: UseChartOptions<T>) => {
  const [isReady, setIsReady] = useState(false);

  const chartApiRef = useRef<ChartApiRef>({
    _chart: null,
    api() {
      return this._chart;
    },
    init() {
      if (this._chart === null) {
        const chart = createChart(container, {
          ...defaultChartOptions,
          ...options,
        });
        this._chart = chart;
        this._chart = createChartHandler(container, options);
      }

      if (!isReady) {
        setIsReady(true);
      }

      return this._chart;
    },
    clear() {
      if (this._chart !== null) {
        setIsReady(false);
        this._chart.remove();
        this._chart = null;
      }
    },
  });

  useLayoutEffect(() => {
    chartApiRef.current.init();

    return () => {
      chartApiRef.current.clear();
    };
  }, []);

  useLayoutEffect(() => {
    if (!container) return;

    if (onClick) {
      chartApiRef.current.api()?.subscribeClick(onClick as any);
    }

    return () => {
      if (onClick) {
        chartApiRef.current.api()?.unsubscribeClick(onClick as any);
      }
    };
  }, [onClick]);

  useLayoutEffect(() => {
    if (!container) return;

    if (onCrosshairMove) {
      chartApiRef.current.api()?.subscribeCrosshairMove(onCrosshairMove as any);
    }

    return () => {
      if (onCrosshairMove) {
        chartApiRef.current.api()?.unsubscribeCrosshairMove(onCrosshairMove as any);
      }
    };
  }, [onCrosshairMove]);

  useLayoutEffect(() => {
    if (!container) return;

    if (onDblClick) {
      chartApiRef.current.api()?.subscribeDblClick(onDblClick as any);
    }

    return () => {
      if (onDblClick) {
        chartApiRef.current.api()?.unsubscribeDblClick(onDblClick as any);
      }
    };
  }, [onDblClick]);

  useLayoutEffect(() => {
    if (!container) return;

    chartApiRef.current.api()?.applyOptions({
      ...defaultChartOptions,
      ...options,
    });
  }, [options]);

  return { chartApiRef, isReady };
};
