import { ForwardedRef, forwardRef, useImperativeHandle } from "react";
import { PriceScaleApiRef, PriceScaleProps } from "./types";
import { usePriceScale } from "./usePriceScale";

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
