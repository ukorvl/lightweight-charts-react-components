import { useCallback, useRef, useState } from "react";
import type {
  CandlestickData,
  IRange,
  ISeriesApi,
  Logical,
  LogicalRangeChangeEventHandler,
  MouseEventHandler,
  MouseEventParams,
  SeriesType,
  Time,
} from "lightweight-charts";
import type {
  CrosshairPosition,
  SeriesApiRef,
} from "lightweight-charts-react-components";
import type { Dispatch, SetStateAction } from "react";

const useSyncCharts = () => {
  const [visibleLogicalRange, setVisibleLogicalRange] = useState<IRange<Logical>>();
  const [chart1Cp, setChart1Cp] = useState<CrosshairPosition | null>(null);
  const [chart2Cp, setChart2Cp] = useState<CrosshairPosition | null>(null);
  const series1Ref = useRef<SeriesApiRef<"Candlestick">>(null);
  const series2Ref = useRef<SeriesApiRef<"Histogram">>(null);

  const onVisibleLogicalRangeChange: LogicalRangeChangeEventHandler = useCallback(r => {
    setChart1Cp(null);
    setChart2Cp(null);

    if (r) {
      setVisibleLogicalRange(r);
    }
  }, []);

  const syncCrosshair = useCallback(
    <T extends Time, U extends SeriesType>(
      param: MouseEventParams<T>,
      series?: ISeriesApi<U, T> | null,
      setCrosshairPosition: Dispatch<
        SetStateAction<CrosshairPosition | null>
      > = setChart1Cp
    ) => {
      if (!param.time || !series) {
        setCrosshairPosition(null);
        return;
      }

      const dataPoint = param.seriesData.get(series) as CandlestickData<Time>;

      if (!dataPoint) {
        setCrosshairPosition(null);
        return;
      }

      setCrosshairPosition(prev =>
        prev?.horizontalPosition === param.time
          ? prev
          : {
              horizontalPosition: dataPoint?.time,
              price: -Infinity,
            }
      );
    },
    []
  );

  const onChart1CrosshairMove: MouseEventHandler<Time> = useCallback(
    param => {
      syncCrosshair(param, series1Ref.current?.api(), setChart2Cp);
    },
    [syncCrosshair, setChart1Cp]
  );

  const onChart2CrosshairMove: MouseEventHandler<Time> = useCallback(
    param => {
      syncCrosshair(param, series2Ref.current?.api(), setChart1Cp);
    },
    [syncCrosshair, setChart2Cp]
  );

  return {
    visibleLogicalRange,
    onVisibleLogicalRangeChange,
    series1Ref,
    series2Ref,
    onChart1CrosshairMove,
    onChart2CrosshairMove,
    chart1Cp,
    chart2Cp,
  };
};

export { useSyncCharts };
