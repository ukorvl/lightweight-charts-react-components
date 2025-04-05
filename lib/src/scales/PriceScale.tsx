import { forwardRef, useImperativeHandle } from "react";
import { usePriceScale } from "./usePriceScale";
import type { PriceScaleApiRef, PriceScaleProps } from "./types";
import type { ForwardedRef } from "react";

const PriceScaleRenderFunction = (
  props: PriceScaleProps,
  ref: ForwardedRef<PriceScaleApiRef>
) => {
  const priceScaleApiRef = usePriceScale(props);
  useImperativeHandle(ref, () => priceScaleApiRef.current, [priceScaleApiRef]);

  return null;
};

const PriceScale = forwardRef(PriceScaleRenderFunction);
PriceScale.displayName = "PriceScale";
export default PriceScale;
