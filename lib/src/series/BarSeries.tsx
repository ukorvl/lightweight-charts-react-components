import { forwardRef } from "react";
import React from "react";
import { SeriesTemplate } from "./SeriesTemplate";
import type { SeriesApiRef, SeriesProps } from "./types";
import type { ForwardedRef, ForwardRefExoticComponent, JSX, RefAttributes } from "react";

const BarSeriesRenderFunction = (
  { children, ...rest }: SeriesProps<"Bar">,
  ref: ForwardedRef<SeriesApiRef<"Bar">>
): JSX.Element => {
  return (
    <SeriesTemplate type="Bar" ref={ref} {...rest}>
      {children}
    </SeriesTemplate>
  );
};

/**
 * BarSeries component that can be used to create a bar series in a chart.
 *
 * @param props - The properties for the bar series.
 * @param ref - The ref to access the bar series API.
 * @returns A React component that renders the bar series.
 * @see {@link https://ukorvl.github.io/lightweight-charts-react-components/docs/series | Series documentation}
 * @see {@link https://tradingview.github.io/lightweight-charts/docs/series-types#bar | TradingView documentation for bar series}
 * @example
 * ```tsx
 * <BarSeries
 *  data={[
 *    { time: '2021-01-01', open: 100, high: 110, low: 90, close: 105 },
 *    { time: '2021-01-02', open: 105, high: 115, low: 95, close: 110 }
 *  ]}
 *  options={{}}
 * />
 * ```
 */
export const BarSeries: ForwardRefExoticComponent<
  SeriesProps<"Bar"> & RefAttributes<SeriesApiRef<"Bar">>
> = forwardRef(BarSeriesRenderFunction);
BarSeries.displayName = "BarSeries";
