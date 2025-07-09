import { forwardRef, useImperativeHandle } from "react";
import { usePriceLine } from "./usePriceLine";
import type { PriceLineApiRef, PriceLineProps } from "./types";
import type { ForwardedRef, ForwardRefExoticComponent, JSX, RefAttributes } from "react";

const PriceLineRenderFunction = (
  props: PriceLineProps,
  ref: ForwardedRef<PriceLineApiRef>
): JSX.Element | null => {
  const priceLineApiRef = usePriceLine(props);
  useImperativeHandle(ref, () => priceLineApiRef.current, [priceLineApiRef]);

  return null;
};

const PriceLine: ForwardRefExoticComponent<
  PriceLineProps & RefAttributes<PriceLineApiRef>
> = forwardRef(PriceLineRenderFunction);
PriceLine.displayName = "PriceLine";
export { PriceLine };
