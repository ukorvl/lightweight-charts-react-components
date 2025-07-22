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

/**
 * PriceLine component that can be used to add a price line to a chart pane.
 *
 * @param props - The properties for the price line.
 * @param ref - The ref to access the price line API.
 * @returns A React component that renders the price line.
 * @see {@link https://ukorvl.github.io/lightweight-charts-react-components/docs/price-lines | Price Lines documentation}
 * @see {@link https://tradingview.github.io/lightweight-charts/tutorials/how_to/price-line | TradingView documentation for price lines}
 * @example
 * ```tsx
 * <PriceLine price={100} options={{}} />
 * ```
 */
export const PriceLine: ForwardRefExoticComponent<
  PriceLineProps & RefAttributes<PriceLineApiRef>
> = forwardRef(PriceLineRenderFunction);
PriceLine.displayName = "PriceLine";
