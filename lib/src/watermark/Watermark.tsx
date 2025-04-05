import { forwardRef, useImperativeHandle } from "react";
import { useWatermark } from "./useWatermark";
import type {
  ImageWatermarkProps,
  TextWatermarkProps,
  WatermarkApiRef,
  WatermarkProps,
  WatermarkType,
} from "./types";
import type { ForwardedRef } from "react";

const WatermarkRenderFunction = <T extends WatermarkType>(
  props: WatermarkProps<T>,
  ref: ForwardedRef<WatermarkApiRef<T>>
) => {
  const watermarkApi = useWatermark(props);
  useImperativeHandle(ref, () => watermarkApi.current, [watermarkApi]);

  return null;
};

const WatermarkText = forwardRef<WatermarkApiRef<"text">, TextWatermarkProps>(
  (props, ref) => {
    return WatermarkRenderFunction({ ...props, type: "text" }, ref);
  }
);

const WatermarkImage = forwardRef<WatermarkApiRef<"image">, ImageWatermarkProps>(
  (props, ref) => {
    return WatermarkRenderFunction({ ...props, type: "image" }, ref);
  }
);

WatermarkText.displayName = "WatermarkText";
WatermarkImage.displayName = "WatermarkImage";

export { WatermarkText, WatermarkImage };
