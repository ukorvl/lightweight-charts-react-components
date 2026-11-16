import {
  createOptionsChart,
  type IChartApiBase,
  type PriceChartOptions,
} from "lightweight-charts";
import { forwardRef } from "react";
import React from "react";
import { ChartComponent } from "./ChartComponent";
import { ChartContainer } from "./ChartContainer";
import type { ChartApiRef, OptionsChartProps } from "./types";
import type {
  ForwardRefExoticComponent,
  ForwardRefRenderFunction,
  RefAttributes,
} from "react";

const OptionsChartRenderFunction: ForwardRefRenderFunction<
  ChartApiRef<number, IChartApiBase<number>>,
  OptionsChartProps
> = ({ children, containerProps, containerRef, ...rest }, ref) => {
  return (
    <ChartContainer containerProps={containerProps} containerRef={containerRef}>
      {container => (
        <ChartComponent<number, IChartApiBase<number>, PriceChartOptions>
          ref={ref}
          container={container}
          createChartApi={createOptionsChart}
          chartKind="options"
          {...rest}
        >
          {children}
        </ChartComponent>
      )}
    </ChartContainer>
  );
};

/**
 * OptionsChart component that can be used to create a price-based horizontal scale chart.
 *
 * @param props - The properties for the options chart.
 * @param ref - The ref to access the chart API.
 * Use `containerRef` to access the wrapper div element.
 * @returns A React component that renders the options chart.
 * @see {@link https://ukorvl.github.io/lightweight-charts-react-components/docs/chart | Chart documentation}
 * @see {@link https://tradingview.github.io/lightweight-charts/docs/chart-types#options-chart-price-based | TradingView documentation for options charts}
 * @example
 * ```tsx
 * <OptionsChart>
 *   <LineSeries data={[{ time: 95, value: 1.2 }, { time: 100, value: 2.8 }]} />
 * </OptionsChart>
 * ```
 */
export const OptionsChart: ForwardRefExoticComponent<
  OptionsChartProps & RefAttributes<ChartApiRef<number, IChartApiBase<number>>>
> = forwardRef(OptionsChartRenderFunction);
OptionsChart.displayName = "OptionsChart";
