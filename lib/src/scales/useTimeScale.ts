import { useLayoutEffect, useRef, useState } from "react";
import { useSafeContext } from "@/_shared/useSafeContext";
import { ChartContext } from "@/chart/ChartContext";
import { usePaneContext } from "@/pane/usePaneContext";
import type { TimeScaleApiRef, TimeScaleProps } from "./types";

export const useTimeScale = ({
  onVisibleTimeRangeChange,
  onVisibleLogicalRangeChange,
  onSizeChange,
  visibleRange,
  visibleLogicalRange,
  options = {},
}: Omit<TimeScaleProps, "children">) => {
  const { isReady: chartIsReady, chartApiRef: chart } = useSafeContext(ChartContext);
  const { isPaneReady, isInsidePane } = usePaneContext();
  const [isReady, setIsReady] = useState(false);

  const timeScaleApiRef = useRef<TimeScaleApiRef>({
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

      if (onVisibleTimeRangeChange) {
        this._timeScale.subscribeVisibleTimeRangeChange(onVisibleTimeRangeChange);
      }

      if (onVisibleLogicalRangeChange) {
        this._timeScale.subscribeVisibleLogicalRangeChange(onVisibleLogicalRangeChange);
      }

      if (onSizeChange) {
        this._timeScale.subscribeSizeChange(onSizeChange);
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
    if (!chart) return;

    if (onSizeChange) {
      timeScaleApiRef.current?.api()?.subscribeSizeChange(onSizeChange);
    }

    return () => {
      if (onSizeChange) {
        timeScaleApiRef.current?.api()?.unsubscribeSizeChange(onSizeChange);
      }
    };
  }, [onSizeChange]);

  useLayoutEffect(() => {
    if (!chart) return;

    if (onVisibleLogicalRangeChange) {
      timeScaleApiRef.current
        ?.api()
        ?.subscribeVisibleLogicalRangeChange(onVisibleLogicalRangeChange);
    }

    return () => {
      if (onVisibleLogicalRangeChange) {
        timeScaleApiRef.current
          ?.api()
          ?.unsubscribeVisibleLogicalRangeChange(onVisibleLogicalRangeChange);
      }
    };
  }, [onVisibleLogicalRangeChange]);

  useLayoutEffect(() => {
    if (!chart) return;

    if (onVisibleTimeRangeChange) {
      timeScaleApiRef.current
        ?.api()
        ?.subscribeVisibleTimeRangeChange(onVisibleTimeRangeChange);
    }

    return () => {
      if (onVisibleTimeRangeChange) {
        timeScaleApiRef.current
          ?.api()
          ?.unsubscribeVisibleTimeRangeChange(onVisibleTimeRangeChange);
      }
    };
  }, [onVisibleTimeRangeChange]);

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
