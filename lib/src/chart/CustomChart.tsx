import {
  createChartEx,
  type DeepPartial,
  type IChartApiBase,
  type IHorzScaleBehavior,
} from "lightweight-charts";
import { forwardRef, useCallback, useState } from "react";
import React from "react";
import { assignRef } from "@/_shared/assignRef";
import { ChartComponent } from "./ChartComponent";
import type { ChartApiRef, CustomChartProps } from "./types";
import type { ForwardedRef, JSX, RefAttributes } from "react";

type CustomChartForwardRefComponent = (<
  HorzScaleItem,
  THorzScaleBehavior extends IHorzScaleBehavior<HorzScaleItem>,
>(
  props: CustomChartProps<HorzScaleItem, THorzScaleBehavior> &
    RefAttributes<ChartApiRef<HorzScaleItem, IChartApiBase<HorzScaleItem>>>
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
    containerRef,
    horzScaleBehavior,
    ...rest
  }: CustomChartProps<HorzScaleItem, THorzScaleBehavior>,
  ref: ForwardedRef<ChartApiRef<HorzScaleItem, IChartApiBase<HorzScaleItem>>>
): JSX.Element => {
  const [container, setContainer] = useState<HTMLDivElement>();
  const handleContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      setContainer(node ?? undefined);
      assignRef(containerRef, node);
    },
    [containerRef]
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
    <div
      ref={handleContainerRef}
      aria-hidden={containerProps?.["aria-hidden"] ?? true}
      {...containerProps}
    >
      {!!container && (
        <ChartComponent<
          HorzScaleItem,
          IChartApiBase<HorzScaleItem>,
          ReturnType<THorzScaleBehavior["options"]>
        >
          ref={ref}
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
 * @param ref - The ref to access the chart API.
 * Use `containerRef` to access the wrapper div element.
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
