import { createChart, type IChartApi, type Time } from "lightweight-charts";
import { forwardRef } from "react";
import React from "react";
import { ChartComponent } from "./ChartComponent";
import { ChartContainer } from "./ChartContainer";
import type { ChartApiRef, ChartProps } from "./types";
import type {
  ForwardRefExoticComponent,
  ForwardRefRenderFunction,
  RefAttributes,
} from "react";

const ChartRenderFunction: ForwardRefRenderFunction<
  ChartApiRef<Time, IChartApi>,
  ChartProps
> = ({ children, containerProps, containerRef, ...rest }, ref) => {
  return (
    <ChartContainer containerProps={containerProps} containerRef={containerRef}>
      {container => (
        <ChartComponent
          ref={ref}
          container={container}
          createChartApi={createChart}
          chartKind="time"
          {...rest}
        >
          {children}
        </ChartComponent>
      )}
    </ChartContainer>
  );
};

/**
 * Chart component that can be used to create a chart.
 *
 * @param props - The properties for the chart.
 * @param ref - The ref to access the chart API.
 * Use `containerRef` to access the wrapper div element.
 * @returns A React component that renders the chart.
 * @see {@link https://ukorvl.github.io/lightweight-charts-react-components/docs/chart | Chart documentation}
 * @see {@link https://tradingview.github.io/lightweight-charts/docs/chart-types | TradingView documentation for charts}
 * @example
 * ```tsx
 * <Chart>
 *   <Pane stretchFactor={2}>
 *     ...
 *   </Pane>
 * </Chart>
 * ```
 */
export const ChartWrapper: ForwardRefExoticComponent<
  ChartProps & RefAttributes<ChartApiRef<Time, IChartApi>>
> = forwardRef(ChartRenderFunction);
ChartWrapper.displayName = "ChartWrapper";
