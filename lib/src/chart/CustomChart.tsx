import {
  createChartEx,
  type DeepPartial,
  type IChartApiBase,
  type IHorzScaleBehavior,
} from "lightweight-charts";
import { forwardRef, useCallback, useState } from "react";
import React from "react";
import { ChartComponent } from "./ChartComponent";
import type { CustomChartProps } from "./types";
import type { ForwardedRef, JSX, RefAttributes } from "react";

type CustomChartForwardRefComponent = (<
  HorzScaleItem,
  THorzScaleBehavior extends IHorzScaleBehavior<HorzScaleItem>,
>(
  props: CustomChartProps<HorzScaleItem, THorzScaleBehavior> &
    RefAttributes<HTMLDivElement>
) => JSX.Element) & {
  displayName: string;
};

const CustomChartRenderFunction = <
  HorzScaleItem,
  THorzScaleBehavior extends IHorzScaleBehavior<HorzScaleItem>,
>(
  {
    children,
    containerProps,
    horzScaleBehavior,
    ...rest
  }: CustomChartProps<HorzScaleItem, THorzScaleBehavior>,
  ref: ForwardedRef<HTMLDivElement>
): JSX.Element => {
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

  const createCustomChart = useCallback(
    (
      chartContainer: HTMLElement,
      options?: DeepPartial<ReturnType<THorzScaleBehavior["options"]>>
    ) => {
      return createChartEx<HorzScaleItem, THorzScaleBehavior>(
        chartContainer,
        horzScaleBehavior,
        options
      );
    },
    [horzScaleBehavior]
  );

  return (
    <div ref={containerRef} {...containerProps}>
      {!!container && (
        <ChartComponent<
          HorzScaleItem,
          IChartApiBase<HorzScaleItem>,
          ReturnType<THorzScaleBehavior["options"]>
        >
          container={container}
          createChartApi={createCustomChart}
          chartKind="custom"
          {...rest}
        >
          {children}
        </ChartComponent>
      )}
    </div>
  );
};

/**
 * CustomChart component that can be used to create a chart with a custom horizontal scale behavior.
 *
 * @param props - The properties for the custom chart.
 * @param ref - The ref to access the chart container.
 * @returns A React component that renders the custom chart.
 * @see {@link https://ukorvl.github.io/lightweight-charts-react-components/docs/chart | Chart documentation}
 * @see {@link https://tradingview.github.io/lightweight-charts/docs/chart-types#custom-horizontal-scale-chart | TradingView documentation for custom horizontal scale charts}
 * @example
 * ```tsx
 * <CustomChart horzScaleBehavior={new (defaultHorzScaleBehavior())()}>
 *   <LineSeries data={[{ time: "2025-01-01", value: 100 }]} />
 * </CustomChart>
 * ```
 */
export const CustomChart = forwardRef(
  CustomChartRenderFunction
) as CustomChartForwardRefComponent;
CustomChart.displayName = "CustomChart";
