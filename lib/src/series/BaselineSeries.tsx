import { forwardRef } from "react";
import React from "react";
import { SeriesTemplate } from "./SeriesTemplate";
import type { SeriesApiRef, SeriesProps } from "./types";
import type { ForwardedRef, ForwardRefExoticComponent, JSX, RefAttributes } from "react";

const BaselineSeriesRenderFunction = (
  { children, ...rest }: SeriesProps<"Baseline">,
  ref: ForwardedRef<SeriesApiRef<"Baseline">>
): JSX.Element => {
  return (
    <SeriesTemplate type="Baseline" ref={ref} {...rest}>
      {children}
    </SeriesTemplate>
  );
};

/**
 * BaselineSeries component that can be used to create a baseline series in a chart.
 *
 * @param props - The properties for the baseline series.
 * @param ref - The ref to access the baseline series API.
 * @returns A React component that renders the baseline series.
 * @see {@link https://ukorvl.github.io/lightweight-charts-react-components/docs/series | Series documentation}
 * @see {@link https://tradingview.github.io/lightweight-charts/docs/series-types#baseline | TradingView documentation for baseline series}
 * @example
 * ```tsx
 * <BaselineSeries
 *  data={[
 *    { time: '2021-01-01', value: 100 },
 *    { time: '2021-01-02', value: 200 }
 *  ]}
 *  options={{}}
 * />
 * ```
 */
export const BaselineSeries: ForwardRefExoticComponent<
  SeriesProps<"Baseline"> & RefAttributes<SeriesApiRef<"Baseline">>
> = forwardRef(BaselineSeriesRenderFunction);
BaselineSeries.displayName = "BaselineSeries";
