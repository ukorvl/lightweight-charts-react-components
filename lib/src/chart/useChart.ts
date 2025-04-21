import { createChart } from "lightweight-charts";
import { useLayoutEffect, useRef, useState } from "react";
import type { ChartApiRef, UseChartOptions } from "./types";

export const useChart = ({
  container,
  onClick,
  onCrosshairMove,
  onInit,
  options = {},
}: UseChartOptions) => {
  const [isReady, setIsReady] = useState(false);

  const chartApiRef = useRef<ChartApiRef>({
    _chart: null,
    api() {
      return this._chart;
    },
    init() {
      if (this._chart === null) {
        this._chart = createChart(container, options);

        if (onInit) {
          onInit(this._chart);
        }
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

    chartApiRef.current.api()?.applyOptions(options);
  }, [options]);

  return { chartApiRef, isReady };
};
