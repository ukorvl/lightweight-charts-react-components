import {
  createYieldCurveChart,
  type IYieldCurveChartApi,
  type YieldCurveChartOptions,
} from "lightweight-charts";
import { forwardRef } from "react";
import React from "react";
import { ChartComponent } from "./ChartComponent";
import { ChartContainer } from "./ChartContainer";
import type { ChartApiRef, YieldCurveChartProps } from "./types";
import type {
  ForwardRefExoticComponent,
  ForwardRefRenderFunction,
  RefAttributes,
} from "react";

const YieldCurveChartRenderFunction: ForwardRefRenderFunction<
  ChartApiRef<number, IYieldCurveChartApi>,
  YieldCurveChartProps
> = ({ children, containerProps, containerRef, ...rest }, ref) => {
  return (
    <ChartContainer containerProps={containerProps} containerRef={containerRef}>
      {container => (
        <ChartComponent<number, IYieldCurveChartApi, YieldCurveChartOptions>
          ref={ref}
          container={container}
          createChartApi={createYieldCurveChart}
          chartKind="yield-curve"
          {...rest}
        >
          {children}
        </ChartComponent>
      )}
    </ChartContainer>
  );
};

/**
 * YieldCurveChart component that can be used to create a yield curve chart.
 *
 * @param props - The properties for the yield curve chart.
 * @param ref - The ref to access the chart API.
 * Use `containerRef` to access the wrapper div element.
 * @returns A React component that renders the yield curve chart.
 * @see {@link https://ukorvl.github.io/lightweight-charts-react-components/docs/chart | Chart documentation}
 * @see {@link https://tradingview.github.io/lightweight-charts/docs/chart-types#yield-curve-chart | TradingView documentation for yield curve charts}
 * @example
 * ```tsx
 * <YieldCurveChart>
 *   <LineSeries data={[{ time: 1, value: 5.2 }, { time: 12, value: 4.7 }]} />
 * </YieldCurveChart>
 * ```
 */
export const YieldCurveChart: ForwardRefExoticComponent<
  YieldCurveChartProps & RefAttributes<ChartApiRef<number, IYieldCurveChartApi>>
> = forwardRef(YieldCurveChartRenderFunction);
YieldCurveChart.displayName = "YieldCurveChart";
