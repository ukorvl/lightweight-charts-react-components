import { useLayoutEffect, useRef } from "react";
import { WatermarkApiRef, WatermarkProps, WatermarkType } from "./types";
import { createTextWatermark, createImageWatermark } from "lightweight-charts";
import { useSafeContext } from "@/shared/useSafeContext";
import { ChartContext } from "@/chart/ChartContext";

export function useWatermark<T extends WatermarkType>(props: WatermarkProps<T>) {
  const chart = useSafeContext(ChartContext);

  const watermarkApiRef = useRef<WatermarkApiRef<T>>({
    _watermark: null,
    destroyed: false,
    api() {
      if (!this._watermark && !this.destroyed) {
        const chartApi = chart.api();
        const pane = chartApi?.panes()[0];
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
        this.destroyed = true;
      }
    },
  } as WatermarkApiRef<T>);

  useLayoutEffect(() => {
    watermarkApiRef.current.api();
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
}

const isTextWatermark = (
  props: WatermarkProps<WatermarkType>,
): props is WatermarkProps<"text"> => {
  return props.type === "text";
};
