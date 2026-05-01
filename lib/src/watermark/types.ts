import type {
  DeepPartial,
  IImageWatermarkPluginApi,
  ITextWatermarkPluginApi,
  ImageWatermarkOptions,
  TextWatermarkOptions,
  Time,
} from "lightweight-charts";

/**
 * Watermark types supported by the library.
 * - `text`: A text watermark.
 * - `image`: An image watermark.
 */
export type WatermarkType = "text" | "image";

/**
 * Unique properties for the text watermark component.
 */
export type TextWatermarkProps = DeepPartial<TextWatermarkOptions>;

/**
 * Unique properties for the image watermark component.
 */
export type ImageWatermarkProps = {
  src: string;
} & DeepPartial<ImageWatermarkOptions>;

/**
 * Watermark component properties that can be used to create either a text or image watermark.
 */
export type WatermarkProps<T extends WatermarkType> = {
  type: T;
} & (T extends "text" ? TextWatermarkProps : ImageWatermarkProps);

/**
 * Watermark API reference type that can be used to access the watermark plugin API.
 */
export type WatermarkApiRef<
  T extends WatermarkType,
  HorzScaleItem = Time,
> = T extends "text"
  ? {
      _watermark: ITextWatermarkPluginApi<HorzScaleItem> | null;
      api: () => ITextWatermarkPluginApi<HorzScaleItem> | null;
      init: () => ITextWatermarkPluginApi<HorzScaleItem> | null;
      clear: () => void;
    }
  : {
      _watermark: IImageWatermarkPluginApi<HorzScaleItem> | null;
      api: () => IImageWatermarkPluginApi<HorzScaleItem> | null;
      init: () => IImageWatermarkPluginApi<HorzScaleItem> | null;
      clear: () => void;
    };
