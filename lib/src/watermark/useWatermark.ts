import { createTextWatermark, createImageWatermark } from "lightweight-charts";
import { useLayoutEffect, useRef } from "react";
import { BaseInternalError } from "@/_shared/InternalError";
import { useSafeContext } from "@/_shared/useSafeContext";
import { ChartContext } from "@/chart/ChartContext";
import { usePaneContext } from "@/pane/usePaneContext";
import type { WatermarkApiRef, WatermarkProps, WatermarkType } from "./types";

const useWatermark = <T extends WatermarkType>(props: WatermarkProps<T>) => {
  const { isReady: chartIsReady, chartApiRef: chart } = useSafeContext(ChartContext);
  const { isPaneReady, isInsidePane, paneApiRef } = usePaneContext();

  const watermarkApiRef = useRef<WatermarkApiRef<T>>({
    _watermark: null,
    api() {
      return this._watermark;
    },
    init() {
      if (this._watermark === null) {
        const chartApi = chart?.api();

        const pane = paneApiRef?.api();

        if (!chartApi || !pane) return null;

        if (isTextWatermark(props)) {
          const { type: _, ...rest } = props;
          this._watermark = createTextWatermark(pane, rest);
        } else {
          const { type: _, src, ...rest } = props as WatermarkProps<"image">;
          this._watermark = createImageWatermark(pane, src, rest);
        }
      }

      return this._watermark;
    },
    clear() {
      if (this._watermark !== null) {
        this._watermark.detach();
        this._watermark = null;
      }
    },
  } as WatermarkApiRef<T>);

  useLayoutEffect(() => {
    if (!chartIsReady) return;

    if (!isInsidePane) {
      throw new BaseInternalError(
        "Watermark must be used inside a pane. Please ensure that the component is wrapped in a pane component.",
        {
          isOperational: true,
          docsPath: "",
        }
      );
    }

    if (!isPaneReady) {
      return;
    }

    watermarkApiRef.current.init();
  }, [chartIsReady, isPaneReady, isInsidePane]);

  useLayoutEffect(() => {
    return () => {
      watermarkApiRef.current.clear();
    };
  }, []);

  useLayoutEffect(() => {
    if (!chart || !props) return;

    const { type: _, ...rest } = props;
    watermarkApiRef.current.api()?.applyOptions(rest);
  }, [props]);

  return watermarkApiRef;
};

const isTextWatermark = (
  props: WatermarkProps<WatermarkType>
): props is WatermarkProps<"text"> => {
  return props.type === "text";
};

export { useWatermark };
