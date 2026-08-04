import { forwardRef, useImperativeHandle } from "react";
import React from "react";
import { ChartContext } from "./ChartContext";
import { useChart } from "./useChart";
import type { ChartApiInstance, ChartApiRef, ChartComponentProps } from "./types";
import type { ChartOptionsImpl } from "lightweight-charts";
import type { ForwardedRef, JSX } from "react";

type GenericChartComponent = (<
  HorzScaleItem,
  TChartApi extends ChartApiInstance<HorzScaleItem> = ChartApiInstance<HorzScaleItem>,
  TOptions extends ChartOptionsImpl<HorzScaleItem> = ChartOptionsImpl<HorzScaleItem>,
>(
  props: ChartComponentProps<HorzScaleItem, TChartApi, TOptions> & {
    ref?: ForwardedRef<ChartApiRef<HorzScaleItem, TChartApi>>;
  }
) => JSX.Element) & {
  displayName?: string;
};

const ChartComponentRenderFunction = <
  HorzScaleItem,
  TChartApi extends ChartApiInstance<HorzScaleItem> = ChartApiInstance<HorzScaleItem>,
  TOptions extends ChartOptionsImpl<HorzScaleItem> = ChartOptionsImpl<HorzScaleItem>,
>(
  {
    children,
    container,
    onClick,
    onCrosshairMove,
    options,
    onDblClick,
    chartKind = "time",
    createChartApi,
  }: ChartComponentProps<HorzScaleItem, TChartApi, TOptions>,
  ref: ForwardedRef<ChartApiRef<HorzScaleItem, TChartApi>>
) => {
  const {
    chartApiRef: { current: chartApiRef },
    isReady,
  } = useChart({
    container,
    onClick,
    onCrosshairMove,
    options,
    onDblClick,
    createChartApi,
  });
  useImperativeHandle(ref, () => chartApiRef, [chartApiRef]);

  return (
    <ChartContext.Provider
      value={{
        chartApiRef: chartApiRef as never,
        isReady,
        chartKind,
      }}
    >
      {children}
    </ChartContext.Provider>
  );
};

const ChartComponent = forwardRef(ChartComponentRenderFunction) as GenericChartComponent;
ChartComponent.displayName = "ChartComponent";

export { ChartComponent };
