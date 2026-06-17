import { createTextWatermark, createImageWatermark } from "lightweight-charts";
import { useLayoutEffect, useRef } from "react";
import { BaseInternalError } from "@/_shared/InternalError";
import { useLatestRef } from "@/_shared/useLatestRef";
import { useSafeContext } from "@/_shared/useSafeContext";
import { ChartContext } from "@/chart/ChartContext";
import type { IChartContext } from "@/chart/types";
import { usePaneContext } from "@/pane/usePaneContext";
import type {
  ImageWatermarkProps,
  TextWatermarkProps,
  WatermarkApiRef,
  WatermarkProps,
  WatermarkType,
} from "./types";
import type { IChartApiBase, Time } from "lightweight-charts";

type WatermarkUpdateOptions<T extends WatermarkType> = T extends "text"
  ? TextWatermarkProps
  : Omit<ImageWatermarkProps, "src">;

const useWatermark = <T extends WatermarkType, HorzScaleItem = Time>(
  props: WatermarkProps<T>
) => {
  const { isReady: chartIsReady, chartApiRef: chart } = useSafeContext(
    ChartContext
  ) as IChartContext<HorzScaleItem, IChartApiBase<HorzScaleItem>>;
  const { isPaneReady, isInsidePane, paneApiRef } = usePaneContext<HorzScaleItem>();
  const propsRef = useLatestRef(props);
  const chartRef = useLatestRef(chart);
  const paneApiRefRef = useLatestRef(paneApiRef);
  const imageSrc = getImageWatermarkSrc(props);

  const watermarkApiRef = useRef<WatermarkApiRef<T, HorzScaleItem>>({
    _watermark: null,
    api() {
      return this._watermark;
    },
    init() {
      if (this._watermark === null) {
        const chartApi = chartRef.current?.api();

        const pane = paneApiRefRef.current?.api();
        const currentProps = propsRef.current;

        if (!chartApi || !pane) return null;

        if (isTextWatermark(currentProps)) {
          const { type: _, ...rest } = currentProps;
          this._watermark = createTextWatermark(pane, rest);
        } else {
          const { type: _, src, ...rest } = currentProps as WatermarkProps<"image">;
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
  } as WatermarkApiRef<T, HorzScaleItem>);

  useLayoutEffect(() => {
    if (!chartIsReady) return;

    if (!isInsidePane) {
      // TODO: Replace the empty docsPath with the published watermarks docs route.
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

    watermarkApiRef.current.clear();
    watermarkApiRef.current.init();
  }, [chartIsReady, isPaneReady, isInsidePane, imageSrc]);

  useLayoutEffect(() => {
    return () => {
      watermarkApiRef.current.clear();
    };
  }, []);

  useLayoutEffect(() => {
    if (!chart || !props) return;

    watermarkApiRef.current.api()?.applyOptions(getWatermarkUpdateOptions(props));
  }, [props]);

  return watermarkApiRef;
};

const getWatermarkUpdateOptions = <T extends WatermarkType>(
  props: WatermarkProps<T>
): WatermarkUpdateOptions<T> => {
  if (isTextWatermark(props)) {
    const { type: _, ...rest } = props;
    return rest as WatermarkUpdateOptions<T>;
  }

  const { type: _, src: __, ...rest } = props as WatermarkProps<"image">;
  return rest as WatermarkUpdateOptions<T>;
};

const getImageWatermarkSrc = <T extends WatermarkType>(
  props: WatermarkProps<T>
): string | undefined => {
  if (isTextWatermark(props)) {
    return undefined;
  }

  return (props as WatermarkProps<"image">).src;
};

const isTextWatermark = (
  props: WatermarkProps<WatermarkType>
): props is WatermarkProps<"text"> => {
  return props.type === "text";
};

export { useWatermark };
