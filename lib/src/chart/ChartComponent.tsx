import React from "react";
import { ChartContext } from "./ChartContext";
import { useChart } from "./useChart";
import type { ChartApiInstance, ChartComponentProps } from "./types";
import type { ChartOptionsImpl } from "lightweight-charts";

const ChartComponent = <
  HorzScaleItem,
  TChartApi extends ChartApiInstance<HorzScaleItem> = ChartApiInstance<HorzScaleItem>,
  TOptions extends ChartOptionsImpl<HorzScaleItem> = ChartOptionsImpl<HorzScaleItem>,
>({
  children,
  container,
  onClick,
  onCrosshairMove,
  onInit,
  options,
  onDblClick,
  chartKind = "time",
  createChartApi,
}: ChartComponentProps<HorzScaleItem, TChartApi, TOptions>) => {
  const {
    chartApiRef: { current: chartApiRef },
    isReady,
  } = useChart({
    container,
    onClick,
    onCrosshairMove,
    onInit,
    options,
    onDblClick,
    createChartApi,
  });

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

export { ChartComponent };
