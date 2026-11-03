import { useRef } from "react";
import {
  Chart as LibraryChart,
  CustomChart as LibraryCustomChart,
  OptionsChart as LibraryOptionsChart,
  YieldCurveChart as LibraryYieldCurveChart,
} from "lightweight-charts-react-components";
import type {
  ChartApiRef,
  ChartProps,
  CustomChartProps,
  OptionsChartProps,
  YieldCurveChartProps,
} from "lightweight-charts-react-components";
import { fontFamily } from "./fontFamily";
import { useRefreshChartFont } from "./useRefreshChartFont";
import type {
  IChartApi,
  IChartApiBase,
  IHorzScaleBehavior,
  IYieldCurveChartApi,
  Time,
} from "lightweight-charts";

const Chart = (props: ChartProps) => {
  const chartRef = useRef<ChartApiRef<Time, IChartApi>>(null);

  useRefreshChartFont(() => {
    chartRef.current?.api()?.applyOptions({ layout: { fontFamily } });
  });

  return <LibraryChart {...props} ref={chartRef} />;
};

const OptionsChart = (props: OptionsChartProps) => {
  const chartRef = useRef<ChartApiRef<number, IChartApiBase<number>>>(null);

  useRefreshChartFont(() => {
    chartRef.current?.api()?.applyOptions({ layout: { fontFamily } });
  });

  return <LibraryOptionsChart {...props} ref={chartRef} />;
};

const YieldCurveChart = (props: YieldCurveChartProps) => {
  const chartRef = useRef<ChartApiRef<number, IYieldCurveChartApi>>(null);

  useRefreshChartFont(() => {
    chartRef.current?.api()?.applyOptions({ layout: { fontFamily } });
  });

  return <LibraryYieldCurveChart {...props} ref={chartRef} />;
};

const CustomChart = <
  HorzScaleItem,
  THorzScaleBehavior extends IHorzScaleBehavior<HorzScaleItem>,
>(
  props: CustomChartProps<HorzScaleItem, THorzScaleBehavior>
) => {
  const chartRef = useRef<ChartApiRef<HorzScaleItem, IChartApiBase<HorzScaleItem>>>(null);

  useRefreshChartFont(() => {
    chartRef.current?.api()?.applyOptions({ layout: { fontFamily } });
  });

  return (
    <LibraryCustomChart<HorzScaleItem, THorzScaleBehavior> {...props} ref={chartRef} />
  );
};

export { Chart, CustomChart, OptionsChart, YieldCurveChart };
