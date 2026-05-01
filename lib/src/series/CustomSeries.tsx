import { forwardRef } from "react";
import React from "react";
import { SeriesTemplate } from "./SeriesTemplate";
import type { SeriesApiRef, SeriesForwardRefComponent, SeriesProps } from "./types";
import type { Time } from "lightweight-charts";
import type { ForwardedRef, JSX } from "react";

const CustomSeriesRenderFunction = <HorzScaleItem = Time,>(
  { children, ...rest }: SeriesProps<"Custom", HorzScaleItem>,
  ref: ForwardedRef<SeriesApiRef<"Custom", HorzScaleItem>>
): JSX.Element => {
  return (
    <SeriesTemplate type="Custom" ref={ref} {...rest}>
      {children}
    </SeriesTemplate>
  );
};

/**
 * CustomSeries component that can be used to create a custom series in a chart.
 *
 * @param props - The properties for the custom series.
 * @param ref - The ref to access the custom series API.
 * @returns A React component that renders the custom series.
 * @see {@link https://ukorvl.github.io/lightweight-charts-react-components/docs/series | Series documentation}
 * @see {@link https://tradingview.github.io/lightweight-charts/docs/series-types#custom-series-plugins | TradingView documentation for custom series}
 * @example
 * ```tsx
 * <CustomSeries
 *  data={[
 *    { time: '2021-01-01', value: 100 },
 *    { time: '2021-01-02', value: 200 }
 *  ]}
 *  options={{}}
 *  plugin={{}}
 * />
 * ```
 */
export const CustomSeries = forwardRef(
  CustomSeriesRenderFunction
) as SeriesForwardRefComponent<"Custom">;
CustomSeries.displayName = "CustomSeries";
