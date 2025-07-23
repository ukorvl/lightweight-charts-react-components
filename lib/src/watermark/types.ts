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

type WatermarkTextApiRefBase = {
  _watermark: ITextWatermarkPluginApi<Time> | null;
  api: () => ITextWatermarkPluginApi<Time> | null;
  init: () => ITextWatermarkPluginApi<Time> | null;
  clear: () => void;
};

type WatermarkImageApiRefBase = {
  _watermark: IImageWatermarkPluginApi<Time> | null;
  api: () => IImageWatermarkPluginApi<Time> | null;
  init: () => IImageWatermarkPluginApi<Time> | null;
  clear: () => void;
};

/**
 * Watermark API reference type that can be used to access the watermark plugin API.
 */
export type WatermarkApiRef<T extends WatermarkType> = T extends "text"
  ? WatermarkTextApiRefBase
  : WatermarkImageApiRefBase;
