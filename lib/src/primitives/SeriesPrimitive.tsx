import { forwardRef, useImperativeHandle } from "react";
import { useSeriesPrimitive } from "./useSeriesPrimitive";
import type { SeriesPrimitiveApiRef, SeriesPrimitiveProps } from "./types";
import type { ForwardedRef } from "react";

const SeriesPrimitiveRenderFunction = (
  props: SeriesPrimitiveProps,
  ref: ForwardedRef<SeriesPrimitiveApiRef>
) => {
  const priceScaleApiRef = useSeriesPrimitive(props);
  useImperativeHandle(ref, () => priceScaleApiRef.current, [priceScaleApiRef]);

  return null;
};

const SeriesPrimitive = forwardRef(SeriesPrimitiveRenderFunction);
SeriesPrimitive.displayName = "Primitive";
export { SeriesPrimitive };
