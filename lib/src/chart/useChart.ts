import { useLayoutEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import { ChartApiRef, ChartOptions } from "./types";

export const useChart = ({
  container,
  ...rest
}: {
  container: HTMLElement;
} & ChartOptions) => {
  const { onClick, onCrosshairMove, onInit, ...restOptions } = rest;
  const [initialized, setInitialized] = useState(false);

  const chartApiRef = useRef<ChartApiRef>({
    _chart: null,
    api() {
      return this._chart;
    },
    init() {
      if (this._chart === null) {
        this._chart = createChart(container, restOptions);

        if (onInit) {
          onInit(this._chart);
        }
      }

      if (!initialized) {
        setInitialized(true);
      }

      return this._chart;
    },
    clear() {
      if (this._chart !== null) {
        setInitialized(false);
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

    chartApiRef.current.api()?.applyOptions(restOptions);
  }, [restOptions]);

  return { chartApiRef, initialized };
};
