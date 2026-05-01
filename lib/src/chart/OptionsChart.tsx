import {
  createOptionsChart,
  type IChartApiBase,
  type PriceChartOptions,
} from "lightweight-charts";
import { forwardRef, useCallback, useState } from "react";
import React from "react";
import { ChartComponent } from "./ChartComponent";
import type { OptionsChartProps } from "./types";
import type {
  ForwardRefExoticComponent,
  ForwardRefRenderFunction,
  RefAttributes,
} from "react";

const OptionsChartRenderFunction: ForwardRefRenderFunction<
  HTMLDivElement,
  OptionsChartProps
> = ({ children, containerProps, ...rest }, ref) => {
  const [container, setContainer] = useState<HTMLDivElement>();
  const containerRef = useCallback(
    (node: HTMLDivElement | null) => {
      setContainer(node ?? undefined);

      if (ref) {
        if (typeof ref === "function") {
          ref(node);
        } else {
          ref.current = node;
        }
      }
    },
    [ref]
  );

  return (
    <div ref={containerRef} {...containerProps}>
      {!!container && (
        <ChartComponent<number, IChartApiBase<number>, PriceChartOptions>
          container={container}
          createChartApi={createOptionsChart}
          chartKind="options"
          {...rest}
        >
          {children}
        </ChartComponent>
      )}
    </div>
  );
};

/**
 * OptionsChart component that can be used to create a price-based horizontal scale chart.
 *
 * @param props - The properties for the options chart.
 * @param ref - The ref to access the chart container.
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
  OptionsChartProps & RefAttributes<HTMLDivElement>
> = forwardRef(OptionsChartRenderFunction);
OptionsChart.displayName = "OptionsChart";
