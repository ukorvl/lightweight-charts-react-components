import { forwardRef } from "react";
import React from "react";
import { SeriesTemplate } from "./SeriesTemplate";
import type { SeriesApiRef, SeriesForwardRefComponent, SeriesProps } from "./types";
import type { Time } from "lightweight-charts";
import type { ForwardedRef, JSX } from "react";

const HistogramSeriesRenderFunction = <HorzScaleItem = Time,>(
  { children, ...rest }: SeriesProps<"Histogram", HorzScaleItem>,
  ref: ForwardedRef<SeriesApiRef<"Histogram", HorzScaleItem>>
): JSX.Element => {
  return (
    <SeriesTemplate type="Histogram" ref={ref} {...rest}>
      {children}
    </SeriesTemplate>
  );
};

/**
 * HistogramSeries component that can be used to create a histogram series in a chart.
 *
 * @param props - The properties for the histogram series.
 * @param ref - The ref to access the histogram series API.
 * @returns A React component that renders the histogram series.
 * @see {@link https://ukorvl.github.io/lightweight-charts-react-components/docs/series | Series documentation}
 * @see {@link https://tradingview.github.io/lightweight-charts/docs/series-types#histogram | TradingView documentation for histogram series}
 * @example
 * ```tsx
 * <HistogramSeries
 *  data={[
 *    { time: '2021-01-01', value: 100 },
 *    { time: '2021-01-02', value: 200 }
 *  ]}
 *  options={{}}
 * />
 * ```
 */
export const HistogramSeries = forwardRef(
  HistogramSeriesRenderFunction
) as SeriesForwardRefComponent<"Histogram">;
HistogramSeries.displayName = "HistogramSeries";
