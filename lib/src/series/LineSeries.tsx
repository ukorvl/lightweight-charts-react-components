import { forwardRef } from "react";
import React from "react";
import { SeriesTemplate } from "./SeriesTemplate";
import type { SeriesApiRef, SeriesForwardRefComponent, SeriesProps } from "./types";
import type { Time } from "lightweight-charts";
import type { ForwardedRef, JSX } from "react";

const LineSeriesRenderFunction = <HorzScaleItem = Time,>(
  { children, ...rest }: SeriesProps<"Line", HorzScaleItem>,
  ref: ForwardedRef<SeriesApiRef<"Line", HorzScaleItem>>
): JSX.Element => {
  return (
    <SeriesTemplate type="Line" ref={ref} {...rest}>
      {children}
    </SeriesTemplate>
  );
};

/**
 * LineSeries component that can be used to create a line series in a chart.
 *
 * @param props - The properties for the line series.
 * @param ref - The ref to access the line series API.
 * @returns A React component that renders the line series.
 * @see {@link https://ukorvl.github.io/lightweight-charts-react-components/docs/series | Series documentation}
 * @see {@link https://tradingview.github.io/lightweight-charts/docs/series-types#line | TradingView documentation for line series}
 * @example
 * ```tsx
 * <LineSeries
 *  data={[
 *    { time: '2021-01-01', value: 100 },
 *    { time: '2021-01-02', value: 200 }
 *  ]}
 *  options={{}}
 * />
 * ```
 */
export const LineSeries = forwardRef(
  LineSeriesRenderFunction
) as SeriesForwardRefComponent<"Line">;
LineSeries.displayName = "LineSeries";
