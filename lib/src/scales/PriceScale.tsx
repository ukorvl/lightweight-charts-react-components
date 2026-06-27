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
 * PriceScale component that can be used to create/customize price scale in a chart.
 * It targets the root pane when rendered directly inside `Chart`, or the active pane when rendered inside `Pane`.
 * For custom scale IDs, use the same value in the target series `options.priceScaleId`.
 *
 * @param props - The properties for the price scale.
 * @param ref - The ref to access the price scale API.
 * @returns A React component that renders the price scale.
 * @see {@link https://ukorvl.github.io/lightweight-charts-react-components/docs/price-scale | Price Scale documentation}
 * @see {@link https://tradingview.github.io/lightweight-charts/docs/price-scale | TradingView documentation for price scale}
 * @example
 * ```tsx
 * <HistogramSeries
 *   data={volumeData}
 *   options={{ priceScaleId: "volume" }}
 * >
 *   <PriceScale id="volume" options={{ scaleMargins: { top: 0.7, bottom: 0 } }} />
 * </HistogramSeries>
 * ```
 */
export const PriceScale: ForwardRefExoticComponent<
  PriceScaleProps & RefAttributes<PriceScaleApiRef>
> = forwardRef(PriceScaleRenderFunction);
PriceScale.displayName = "PriceScale";
