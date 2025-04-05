import { useLayoutEffect, useRef } from "react";
import { TimeScaleApiRef, TimeScaleProps } from "./types";
import { useSafeContext } from "@/shared/useSafeContext";
import { ChartContext } from "@/chart/ChartContext";

export const useTimeScale = ({
  onVisibleTimeRangeChange,
  onVisibleLogicalRangeChange,
  onSizeChange,
  visibleRange,
  visibleLogicalRange,
  options = {},
}: TimeScaleProps) => {
  const { initialized: chartInitialized, chartApiRef: chart } =
    useSafeContext(ChartContext);

  if (!chart) {
    throw new Error("Chart context not found");
  }

  const timeScaleApiRef = useRef<TimeScaleApiRef>({
    _timeScale: null,
    api() {
      return this._timeScale;
    },
    init() {
      if (!this._timeScale) {
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
      }

      return this._timeScale;
    },
    clear() {
      this._timeScale = null;
    },
  });

  useLayoutEffect(() => {
    if (!chartInitialized) return;

    timeScaleApiRef.current.init();
  }, [chartInitialized]);

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

  return timeScaleApiRef;
};
