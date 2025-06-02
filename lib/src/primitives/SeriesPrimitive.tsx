import { forwardRef, useImperativeHandle } from "react";
import { useSeriesPrimitive } from "./useSeriesPrimitive";
import type { SeriesPrimitiveApiRef, SeriesPrimitiveProps } from "./types";
import type { SeriesType } from "lightweight-charts";
import type { ForwardedRef } from "react";

type GenericSeriesPrimitiveComponent = (<T extends SeriesType>(
  props: SeriesPrimitiveProps<T> & {
    ref?: ForwardedRef<SeriesPrimitiveApiRef>;
  }
) => ReturnType<typeof SeriesPrimitiveRenderFunction>) & {
  displayName: string;
};

const SeriesPrimitiveRenderFunction = <T extends SeriesType>(
  props: SeriesPrimitiveProps<T>,
  ref: ForwardedRef<SeriesPrimitiveApiRef>
) => {
  const seriesPrimitiveApiRef = useSeriesPrimitive(props);
  useImperativeHandle(ref, () => seriesPrimitiveApiRef.current, [seriesPrimitiveApiRef]);

  return null;
};

const SeriesPrimitive = forwardRef(
  SeriesPrimitiveRenderFunction
) as GenericSeriesPrimitiveComponent;
SeriesPrimitive.displayName = "SeriesPrimitive";
export { SeriesPrimitive };
