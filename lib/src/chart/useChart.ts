import {
  createChart,
  type ChartOptionsImpl,
  type DeepPartial,
  type Time,
} from "lightweight-charts";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { defaultChartOptions } from "./defaultChartOptions";
import type {
  ChartApiInstance,
  ChartApiRef,
  CreateChartApi,
  UseChartOptions,
} from "./types";

export const useChart = <
  HorzScaleItem = Time,
  TChartApi extends ChartApiInstance<HorzScaleItem> = ChartApiInstance<HorzScaleItem>,
  TOptions extends ChartOptionsImpl<HorzScaleItem> = ChartOptionsImpl<HorzScaleItem>,
>({
  container,
  onClick,
  onCrosshairMove,
  options = {},
  onDblClick,
  createChartApi = createChart as unknown as CreateChartApi<
    HorzScaleItem,
    TChartApi,
    TOptions
  >,
}: UseChartOptions<HorzScaleItem, TChartApi, TOptions>) => {
  const [isReady, setIsReady] = useState(false);

  const chartApiRef = useRef<ChartApiRef<HorzScaleItem, TChartApi>>({
    _chart: null,
    _isDisposing: false,
    api() {
      return this._chart;
    },
    init() {
      this._isDisposing = false;

      if (this._chart === null) {
        const chart = createChartApi(container, {
          ...defaultChartOptions,
          ...options,
        } as DeepPartial<TOptions>);
        this._chart = chart;
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

    // On deletion this runs before child cleanups, so series can skip native
    // removal: it would rebuild the timeline and fire user range handlers.
    return () => {
      chartApiRef.current._isDisposing = true;
    };
  }, []);

  // Children detach plugins in layout cleanup. Destroy the chart afterwards so
  // their invalidations cannot schedule drawing against disposed canvases.
  useEffect(() => {
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

    if (onDblClick) {
      chartApiRef.current.api()?.subscribeDblClick(onDblClick);
    }

    return () => {
      if (onDblClick) {
        chartApiRef.current.api()?.unsubscribeDblClick(onDblClick);
      }
    };
  }, [onDblClick]);

  useLayoutEffect(() => {
    if (!container) return;

    chartApiRef.current.api()?.applyOptions({
      ...defaultChartOptions,
      ...options,
    } as DeepPartial<TOptions>);
  }, [options]);

  return { chartApiRef, isReady };
};
