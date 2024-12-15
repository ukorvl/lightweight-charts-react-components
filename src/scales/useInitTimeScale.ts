import { useContext, useLayoutEffect, useRef } from "react";
import { ChartContext } from "../ChartContext";
import { TimeScaleApiRef, TimeScaleProps } from "./types";
import { timeScaleDefaultOptions } from "./scalesDefaultOptions";

export const useInitTimeScale = ({
  onVisibleTimeRangeChange,
  onVisibleLogicalRangeChange,
  onSizeChange,
  visibleRange,
  visibleLogicalRange,
  options,
}: TimeScaleProps) => {
  const chart = useContext(ChartContext);

  if (!chart) {
    throw new Error("Chart context not found");
  }

  const timeScaleApiRef = useRef<TimeScaleApiRef>({
    _timeScale: null,
    api() {
      if (!this._timeScale) {
        const chartApi = chart.api();

        if (!chartApi) {
          return null;
        }

        this._timeScale = chartApi.timeScale();

        this._timeScale.applyOptions({
          ...timeScaleDefaultOptions,
          ...options,
        });

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
      if (this._timeScale !== null) {
        this._timeScale = null;
      }
    },
  });

  useLayoutEffect(() => {
    timeScaleApiRef.current.api();

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
      timeScaleApiRef.current?.api()?.subscribeVisibleLogicalRangeChange(onVisibleLogicalRangeChange);
    }

    return () => {
      if (onVisibleLogicalRangeChange) {
        timeScaleApiRef.current?.api()?.unsubscribeVisibleLogicalRangeChange(onVisibleLogicalRangeChange);
      }
    };
  }, [onVisibleLogicalRangeChange]);

  useLayoutEffect(() => {
    if (!chart) return;

    if (onVisibleTimeRangeChange) {
      timeScaleApiRef.current?.api()?.subscribeVisibleTimeRangeChange(onVisibleTimeRangeChange);
    }

    return () => {
      if (onVisibleTimeRangeChange) {
        timeScaleApiRef.current?.api()?.unsubscribeVisibleTimeRangeChange(onVisibleTimeRangeChange);
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
