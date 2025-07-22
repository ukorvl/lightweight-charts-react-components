import { forwardRef } from "react";
import React from "react";
import { SeriesTemplate } from "./SeriesTemplate";
import type { SeriesApiRef, SeriesProps } from "./types";
import type { ForwardedRef, ForwardRefExoticComponent, JSX, RefAttributes } from "react";

const CandlestickSeriesRenderFunction = (
  { children, ...rest }: SeriesProps<"Candlestick">,
  ref: ForwardedRef<SeriesApiRef<"Candlestick">>
): JSX.Element => {
  return (
    <SeriesTemplate type="Candlestick" ref={ref} {...rest}>
      {children}
    </SeriesTemplate>
  );
};

/**
 * CandlestickSeries component that can be used to create a candlestick series in a chart.
 *
 * @param props - The properties for the candlestick series.
 * @param ref - The ref to access the candlestick series API.
 * @returns A React component that renders the candlestick series.
 * @see {@link https://ukorvl.github.io/lightweight-charts-react-components/docs/series | Series documentation}
 * @see {@link https://tradingview.github.io/lightweight-charts/docs/series-types#candlestick | TradingView documentation for candlestick series}
 * @example
 * ```tsx
 * <CandlestickSeries
 *  data={[
 *    { time: '2021-01-01', open: 100, high: 110, low: 90, close: 105 },
 *    { time: '2021-01-02', open: 105, high: 115, low: 95, close: 110 }
 *  ]}
 *  options={{}}
 * />
 * ```
 */
export const CandlestickSeries: ForwardRefExoticComponent<
  SeriesProps<"Candlestick"> & RefAttributes<SeriesApiRef<"Candlestick">>
> = forwardRef(CandlestickSeriesRenderFunction);
CandlestickSeries.displayName = "CandlestickSeries";
