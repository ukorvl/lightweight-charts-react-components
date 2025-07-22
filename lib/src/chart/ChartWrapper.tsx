import { forwardRef, useCallback, useState } from "react";
import React from "react";
import { ChartComponent } from "./ChartComponent";
import type { ChartProps } from "./types";
import type {
  ForwardRefExoticComponent,
  ForwardRefRenderFunction,
  RefAttributes,
} from "react";

const ChartRenderFunction: ForwardRefRenderFunction<HTMLDivElement, ChartProps> = (
  { children, containerProps, ...rest },
  ref
) => {
  const [container, setContainer] = useState<HTMLDivElement>();
  const containerRef = useCallback(
    (r: HTMLDivElement) => {
      setContainer(r);

      if (ref) {
        if (typeof ref === "function") {
          containerRef(r);
        } else {
          ref.current = r;
        }
      }
    },
    [ref]
  );

  return (
    <div ref={containerRef} {...containerProps}>
      {!!container && (
        <ChartComponent container={container} {...rest}>
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
  ChartProps & RefAttributes<HTMLDivElement>
> = forwardRef(ChartRenderFunction);
ChartWrapper.displayName = "ChartWrapper";
