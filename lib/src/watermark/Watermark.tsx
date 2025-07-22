import { forwardRef, useImperativeHandle } from "react";
import { useWatermark } from "./useWatermark";
import type {
  ImageWatermarkProps,
  TextWatermarkProps,
  WatermarkApiRef,
  WatermarkProps,
  WatermarkType,
} from "./types";
import type { ForwardedRef, ForwardRefExoticComponent, RefAttributes } from "react";

const WatermarkRenderFunction = <T extends WatermarkType>(
  props: WatermarkProps<T>,
  ref: ForwardedRef<WatermarkApiRef<T>>
) => {
  const watermarkApi = useWatermark(props);
  useImperativeHandle(ref, () => watermarkApi.current, [watermarkApi]);

  return null;
};

/**
 * Watermark component that can be used to add a text or image watermark to a chart pane.
 *
 * @param props - The properties for the watermark.
 * @param ref - The ref to access the watermark API.
 * @returns A React component that renders the watermark.
 * @see {@link https://ukorvl.github.io/lightweight-charts-react-components/docs/watermarks | Watermarks documentation}
 * @see {@link https://tradingview.github.io/lightweight-charts/tutorials/how_to/watermark | TradingView documentation for watermarks}
 * @example
 * ```tsx
 * <WatermarkText
 *  lines={[
 *    { text: "Your chart name", color: "blue", fontSize: 24 },
 *    { text: "Some other text", color: "pink", fontSize: 16 },
 *  ]}
 *  horzAlign="center"
 * />
 * ```
 */
export const WatermarkText: ForwardRefExoticComponent<
  TextWatermarkProps & RefAttributes<WatermarkApiRef<"text">>
> = forwardRef<WatermarkApiRef<"text">, TextWatermarkProps>((props, ref) => {
  return WatermarkRenderFunction({ ...props, type: "text" }, ref);
});

/**
 * Watermark component that can be used to add an image watermark to a chart pane.
 *
 * @param props - The properties for the image watermark.
 * @param ref - The ref to access the watermark API.
 * @returns A React component that renders the image watermark.
 * @see {@link https://ukorvl.github.io/lightweight-charts-react-components/docs/watermarks | Watermarks documentation}
 * @see {@link https://tradingview.github.io/lightweight-charts/tutorials/how_to/watermark | TradingView documentation for watermarks}
 * @example
 * ```tsx
 * <WatermarkImage
 *  src="data:image/svg+xml;base64,..."
 *  alpha={0.5}
 *  padding={20}
 * />
 * ```
 */
export const WatermarkImage: ForwardRefExoticComponent<
  ImageWatermarkProps & RefAttributes<WatermarkApiRef<"image">>
> = forwardRef<WatermarkApiRef<"image">, ImageWatermarkProps>((props, ref) => {
  return WatermarkRenderFunction({ ...props, type: "image" }, ref);
});

WatermarkText.displayName = "WatermarkText";
WatermarkImage.displayName = "WatermarkImage";
