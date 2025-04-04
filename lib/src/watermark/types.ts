import {
  DeepPartial,
  IImageWatermarkPluginApi,
  ITextWatermarkPluginApi,
  ImageWatermarkOptions,
  TextWatermarkOptions,
  Time,
} from "lightweight-charts";

export type WatermarkType = "text" | "image";

export type TextWatermarkProps = DeepPartial<TextWatermarkOptions>;

export type ImageWatermarkProps = {
  src: string;
} & DeepPartial<ImageWatermarkOptions>;

export type WatermarkProps<T extends WatermarkType> = {
  type: T;
} & (T extends "text" ? TextWatermarkProps : ImageWatermarkProps);

export type WatermarkTextApiRefBase = {
  _watermark: ITextWatermarkPluginApi<Time> | null;
  api: () => ITextWatermarkPluginApi<Time> | null;
  clear: () => void;
  destroyed: boolean;
};

export type WatermarkImageApiRefBase = {
  _watermark: IImageWatermarkPluginApi<Time> | null;
  api: () => IImageWatermarkPluginApi<Time> | null;
  clear: () => void;
  destroyed: boolean;
};

export type WatermarkApiRef<T extends WatermarkType> = T extends "text"
  ? WatermarkTextApiRefBase
  : WatermarkImageApiRefBase;
