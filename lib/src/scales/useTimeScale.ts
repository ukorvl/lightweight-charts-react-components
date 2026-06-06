import { useLayoutEffect, useRef, useState } from "react";
import { useSafeContext } from "@/_shared/useSafeContext";
import { ChartContext } from "@/chart/ChartContext";
import type { IChartContext } from "@/chart/types";
import { usePaneContext } from "@/pane/usePaneContext";
import type { TimeScaleApiRef, TimeScaleProps } from "./types";
import type { IChartApiBase, Time } from "lightweight-charts";

export const useTimeScale = <HorzScaleItem = Time>({
  onVisibleTimeRangeChange,
  onVisibleLogicalRangeChange,
  onSizeChange,
  visibleRange,
  visibleLogicalRange,
  options = {},
}: Omit<TimeScaleProps<HorzScaleItem>, "children">) => {
  const { isReady: chartIsReady, chartApiRef: chart } = useSafeContext(
    ChartContext
  ) as IChartContext<HorzScaleItem, IChartApiBase<HorzScaleItem>>;
  const { isPaneReady, isInsidePane } = usePaneContext<HorzScaleItem>();
  const [isReady, setIsReady] = useState(false);

  const timeScaleApiRef = useRef<TimeScaleApiRef<HorzScaleItem>>({
    _timeScale: null,
    api() {
      return this._timeScale;
    },
    init() {
      if (this._timeScale) {
        return this._timeScale;
      }

      const chartApi = chart?.api();

      if (!chartApi) {
        return null;
      }

      this._timeScale = chartApi.timeScale();

      this._timeScale.applyOptions(options);

      if (visibleRange) {
        this._timeScale.setVisibleRange(visibleRange);
      }

      if (visibleLogicalRange) {
        this._timeScale.setVisibleLogicalRange(visibleLogicalRange);
      }

      setIsReady(true);

      return this._timeScale;
    },
    clear() {
      this._timeScale = null;
      setIsReady(false);
    },
  });

  useLayoutEffect(() => {
    if (!chartIsReady) return;

    if (isInsidePane && !isPaneReady) {
      return;
    }

    timeScaleApiRef.current.init();
  }, [chartIsReady, isInsidePane, isPaneReady]);

  useLayoutEffect(() => {
    return () => {
      timeScaleApiRef.current.clear();
    };
  }, []);

  useLayoutEffect(() => {
    if (!chart) return;

    if (options) {
      timeScaleApiRef.current?.api()?.applyOptions(options);
    }
  }, [options]);

  useLayoutEffect(() => {
    if (!chart || !isReady) return;

    const timeScaleApi = timeScaleApiRef.current.api();

    if (onSizeChange && timeScaleApi) {
      timeScaleApi.subscribeSizeChange(onSizeChange);
    }

    return () => {
      if (onSizeChange && timeScaleApi) {
        timeScaleApi.unsubscribeSizeChange(onSizeChange);
      }
    };
  }, [chart, isReady, onSizeChange]);

  useLayoutEffect(() => {
    if (!chart || !isReady) return;

    const timeScaleApi = timeScaleApiRef.current.api();

    if (onVisibleLogicalRangeChange && timeScaleApi) {
      timeScaleApi.subscribeVisibleLogicalRangeChange(onVisibleLogicalRangeChange);
    }

    return () => {
      if (onVisibleLogicalRangeChange && timeScaleApi) {
        timeScaleApi.unsubscribeVisibleLogicalRangeChange(onVisibleLogicalRangeChange);
      }
    };
  }, [chart, isReady, onVisibleLogicalRangeChange]);

  useLayoutEffect(() => {
    if (!chart || !isReady) return;

    const timeScaleApi = timeScaleApiRef.current.api();

    if (onVisibleTimeRangeChange && timeScaleApi) {
      timeScaleApi.subscribeVisibleTimeRangeChange(onVisibleTimeRangeChange);
    }

    return () => {
      if (onVisibleTimeRangeChange && timeScaleApi) {
        timeScaleApi.unsubscribeVisibleTimeRangeChange(onVisibleTimeRangeChange);
      }
    };
  }, [chart, isReady, onVisibleTimeRangeChange]);

  useLayoutEffect(() => {
    if (!chart) return;

    if (visibleRange) {
      timeScaleApiRef.current?.api()?.setVisibleRange(visibleRange);
    }
  }, [visibleRange]);

  useLayoutEffect(() => {
    if (!chart) return;

    if (visibleLogicalRange) {
      timeScaleApiRef.current?.api()?.setVisibleLogicalRange(visibleLogicalRange);
    }
  }, [visibleLogicalRange]);

  return { timeScaleApiRef, isReady };
};
