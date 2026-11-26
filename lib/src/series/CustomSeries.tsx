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
 * Requires a plugin implementing the upstream ICustomSeriesPaneView interface.
 *
 * @param props - The properties for the custom series.
 * @param ref - The ref to access the custom series API.
 * @returns A React component that renders the custom series.
 * @see {@link https://ukorvl.github.io/lightweight-charts-react-components/docs/series | Series documentation}
 * @see {@link https://tradingview.github.io/lightweight-charts/docs/series-types#custom-series-plugins | TradingView documentation for custom series}
 * @see {@link https://github.com/ukorvl/lightweight-charts-react-components/tree/main/examples/src/samples/CustomSeries | GroupedBarsSeries plugin implementation used in this example}
 * @example
 * ```tsx
 * import { CustomSeries } from "lightweight-charts-react-components";
 * import { GroupedBarsSeries } from "./plugin"; // Copy from the linked demo.
 *
 * <CustomSeries
 *  data={[
 *    { time: '2021-01-01', customValues: { values: [100, 150] } },
 *    { time: '2021-01-02', customValues: { values: [200, 250] } }
 *  ]}
 *  plugin={new GroupedBarsSeries()}
 * />
 * ```
 */
export const CustomSeries = forwardRef(
  CustomSeriesRenderFunction
) as SeriesForwardRefComponent<"Custom">;
CustomSeries.displayName = "CustomSeries";
