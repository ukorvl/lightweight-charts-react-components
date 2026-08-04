import { createChart, type IChartApi, type Time } from "lightweight-charts";
import { forwardRef, useCallback, useState } from "react";
import React from "react";
import { assignRef } from "@/_shared/assignRef";
import { ChartComponent } from "./ChartComponent";
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
    </div>
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
