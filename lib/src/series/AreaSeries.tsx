import { forwardRef } from "react";
import React from "react";
import { SeriesTemplate } from "./SeriesTemplate";
import type { SeriesApiRef, SeriesProps } from "./types";
import type { ForwardedRef, ForwardRefExoticComponent, JSX, RefAttributes } from "react";

const AreaSeriesRenderFunction = (
  { children, ...rest }: SeriesProps<"Area">,
  ref: ForwardedRef<SeriesApiRef<"Area">>
): JSX.Element => {
  return (
    <SeriesTemplate type="Area" ref={ref} {...rest}>
      {children}
    </SeriesTemplate>
  );
};

/**
 * AreaSeries component that can be used to create an area series in a chart.
 *
 * @param props - The properties for the area series.
 * @param ref - The ref to access the area series API.
 * @returns A React component that renders the area series.
 * @see {@link https://ukorvl.github.io/lightweight-charts-react-components/docs/series | Series documentation}
 * @see {@link https://tradingview.github.io/lightweight-charts/docs/series-types#area | TradingView documentation for area series}
 * @example
 * ```tsx
 * <AreaSeries
 *  data={[
 *    { time: '2021-01-01', value: 100 },
 *    { time: '2021-01-02', value: 200 }
 *  ]}
 *  options={{}}
 * />
 * ```
 */
export const AreaSeries: ForwardRefExoticComponent<
  SeriesProps<"Area"> & RefAttributes<SeriesApiRef<"Area">>
> = forwardRef(AreaSeriesRenderFunction);
AreaSeries.displayName = "AreaSeries";
