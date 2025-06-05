import { forwardRef, useImperativeHandle } from "react";
import { usePriceScale } from "./usePriceScale";
import type { PriceScaleApiRef, PriceScaleProps } from "./types";
import type { ForwardedRef, ForwardRefExoticComponent, RefAttributes } from "react";

const PriceScaleRenderFunction = (
  props: PriceScaleProps,
  ref: ForwardedRef<PriceScaleApiRef>
): null => {
  const priceScaleApiRef = usePriceScale(props);
  useImperativeHandle(ref, () => priceScaleApiRef.current, [priceScaleApiRef]);

  return null;
};

const PriceScale: ForwardRefExoticComponent<
  PriceScaleProps & RefAttributes<PriceScaleApiRef>
> = forwardRef(PriceScaleRenderFunction);
PriceScale.displayName = "PriceScale";
export { PriceScale };
