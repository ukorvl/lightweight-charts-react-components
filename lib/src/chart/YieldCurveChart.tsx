import {
  createYieldCurveChart,
  type IYieldCurveChartApi,
  type YieldCurveChartOptions,
} from "lightweight-charts";
import { forwardRef, useCallback, useState } from "react";
import React from "react";
import { assignRef } from "@/_shared/assignRef";
import { ChartComponent } from "./ChartComponent";
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
  const [container, setContainer] = useState<HTMLDivElement>();
  const handleContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      setContainer(node ?? undefined);
      assignRef(containerRef, node);
    },
    [containerRef]
  );

  return (
    <div
      ref={handleContainerRef}
      aria-hidden={containerProps?.["aria-hidden"] ?? true}
      {...containerProps}
    >
      {!!container && (
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
    </div>
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
