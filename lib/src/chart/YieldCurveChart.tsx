import {
  createYieldCurveChart,
  type IYieldCurveChartApi,
  type YieldCurveChartOptions,
} from "lightweight-charts";
import { forwardRef, useCallback, useState } from "react";
import React from "react";
import { ChartComponent } from "./ChartComponent";
import type { YieldCurveChartProps } from "./types";
import type {
  ForwardRefExoticComponent,
  ForwardRefRenderFunction,
  RefAttributes,
} from "react";

const YieldCurveChartRenderFunction: ForwardRefRenderFunction<
  HTMLDivElement,
  YieldCurveChartProps
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
        <ChartComponent<number, IYieldCurveChartApi, YieldCurveChartOptions>
          container={container}
          createChartApi={createYieldCurveChart}
          chartKind="yield-curve"
          {...rest}
        >
          {children}
        </ChartComponent>
      )}
    </div>
  );
};

/**
 * YieldCurveChart component that can be used to create a yield curve chart.
 *
 * @param props - The properties for the yield curve chart.
 * @param ref - The ref to access the chart container.
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
  YieldCurveChartProps & RefAttributes<HTMLDivElement>
> = forwardRef(YieldCurveChartRenderFunction);
YieldCurveChart.displayName = "YieldCurveChart";
