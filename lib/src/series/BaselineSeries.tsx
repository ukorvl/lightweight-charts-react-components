import { forwardRef } from "react";
import React from "react";
import { SeriesTemplate } from "./SeriesTemplate";
import type { SeriesApiRef, SeriesForwardRefComponent, SeriesProps } from "./types";
import type { Time } from "lightweight-charts";
import type { ForwardedRef, JSX } from "react";

const BaselineSeriesRenderFunction = <HorzScaleItem = Time,>(
  { children, ...rest }: SeriesProps<"Baseline", HorzScaleItem>,
  ref: ForwardedRef<SeriesApiRef<"Baseline", HorzScaleItem>>
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
export const BaselineSeries = forwardRef(
  BaselineSeriesRenderFunction
) as SeriesForwardRefComponent<"Baseline">;
BaselineSeries.displayName = "BaselineSeries";
