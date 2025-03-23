import { ForwardedRef, forwardRef, useImperativeHandle } from "react";
import { PriceLineApiRef, PriceLineProps } from "./types";
import { useInitPriceLine } from "./useInitPriceLine";

const PriceLineRenderFunction = (props: PriceLineProps, ref: ForwardedRef<PriceLineApiRef>) => {
  const priceLineApiRef = useInitPriceLine(props);
  useImperativeHandle(ref, () => priceLineApiRef.current, [priceLineApiRef]);

  return null;
};

const PriceLine = forwardRef(PriceLineRenderFunction);
PriceLine.displayName = "PriceLine";
export default PriceLine;
