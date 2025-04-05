import { ForwardedRef, forwardRef, useImperativeHandle } from "react";
import { PriceLineApiRef, PriceLineProps } from "./types";
import { usePriceLine } from "./usePriceLine";

const PriceLineRenderFunction = (
  props: PriceLineProps,
  ref: ForwardedRef<PriceLineApiRef>
) => {
  const priceLineApiRef = usePriceLine(props);
  useImperativeHandle(ref, () => priceLineApiRef.current, [priceLineApiRef]);

  return null;
};

const PriceLine = forwardRef(PriceLineRenderFunction);
PriceLine.displayName = "PriceLine";
export default PriceLine;
