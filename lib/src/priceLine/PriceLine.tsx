import { forwardRef, useImperativeHandle } from "react";
import { usePriceLine } from "./usePriceLine";
import type { PriceLineApiRef, PriceLineProps } from "./types";
import type { ForwardedRef } from "react";

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
