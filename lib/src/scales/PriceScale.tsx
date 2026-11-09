import { forwardRef, useImperativeHandle } from "react";
import { usePriceScale } from "./usePriceScale";
import type { PriceScaleApiRef, PriceScaleProps } from "./types";
import type { ForwardedRef, ForwardRefExoticComponent, JSX, RefAttributes } from "react";

const PriceScaleRenderFunction = (
  props: PriceScaleProps,
  ref: ForwardedRef<PriceScaleApiRef>
): JSX.Element | null => {
  const priceScaleApiRef = usePriceScale(props);
  useImperativeHandle(ref, () => priceScaleApiRef.current, [priceScaleApiRef]);

  return null;
};

/**
 * PriceScale component that can be used to customize a price scale of the pane it is rendered in.
 *
 * @param props - The properties for the price scale.
 * @param ref - The ref to access the price scale API.
 * @returns A React component that renders the price scale.
 * @see {@link https://ukorvl.github.io/lightweight-charts-react-components/docs/price-scale | Price Scale documentation}
 * @see {@link https://tradingview.github.io/lightweight-charts/docs/price-scale | TradingView documentation for price scale}
 * @example
 * ```tsx
 * <PriceScale id="right" options={{}} />
 *
 * // Custom overlay price scale used by the parent series
 * <HistogramSeries data={volume} options={{ priceScaleId: "volume" }}>
 *   <PriceScale id="volume" options={{ scaleMargins: { top: 0.8, bottom: 0 } }} />
 * </HistogramSeries>
 * ```
 */
export const PriceScale: ForwardRefExoticComponent<
  PriceScaleProps & RefAttributes<PriceScaleApiRef>
> = forwardRef(PriceScaleRenderFunction);
PriceScale.displayName = "PriceScale";
