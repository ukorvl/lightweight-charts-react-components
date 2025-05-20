import type { ISeriesPrimitive } from "lightweight-charts";

export type SeriesPrimitiveProps = {
  plugin: ISeriesPrimitive;
};

export type SeriesPrimitiveApiRef = {
  _primitive: ISeriesPrimitive | null;
  api(): ISeriesPrimitive | null;
  init(): ISeriesPrimitive | null;
  clear(): void;
};
