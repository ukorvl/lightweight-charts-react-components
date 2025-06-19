import { CrosshairMode } from "lightweight-charts";
import {
  BaselineSeries,
  CandlestickSeries,
  Chart,
  PriceLine,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import { useCallback, useMemo, useState } from "react";
import { colors } from "@/colors";
import { withChartCommonOptions } from "@/common/chartCommonOptions";
import { samplesLinks } from "@/samples";
import { seriesData } from "./syncingChartsStore";
import { ChartWidgetCard } from "../../ui/ChartWidgetCard";
import type { LogicalRangeChangeEventHandler } from "lightweight-charts";

const SyncingCharts = () => {
  const [visibleRange, setVisibleRange] = useState(null);
  const crosshairPosition = useMemo(() => {
    return {
      price: seriesData[5].close,
      horizontalPosition: seriesData[5].time,
    };
  }, []);

  const onVisibleLogicalRangeChange: LogicalRangeChangeEventHandler = useCallback(r => {
    queueMicrotask(() => {
      setVisibleRange(r);
    });
  }, []);

  return (
    <ChartWidgetCard
      title="Syncing Charts"
      subTitle="Multiple charts with synced crosshairs and visible logical range"
      sampleConfig={samplesLinks.SyncingCharts}
    >
      <Chart
        options={withChartCommonOptions({
          crosshair: {
            mode: CrosshairMode.Normal,
          },
          timeScale: {
            visible: false,
          },
        })}
        containerProps={{
          style: { flexBasis: "50%", borderBottom: `1px solid ${colors.gray100}` },
        }}
      >
        <TimeScale onVisibleLogicalRangeChange={onVisibleLogicalRangeChange}>
          <TimeScaleFitContentTrigger deps={[]} />
        </TimeScale>
        <CandlestickSeries
          data={seriesData}
          options={{
            upColor: colors.green,
            downColor: colors.red,
            borderUpColor: colors.green,
            borderDownColor: colors.red,
            wickUpColor: colors.green,
            wickDownColor: colors.red,
            priceLineVisible: false,
          }}
          crosshairPosition={crosshairPosition}
        />
      </Chart>
      <Chart
        options={withChartCommonOptions({
          crosshair: {
            mode: CrosshairMode.Normal,
          },
        })}
        containerProps={{ style: { flexBasis: "50%" } }}
      >
        <TimeScale visibleLogicalRange={visibleRange}>
          <TimeScaleFitContentTrigger deps={[]} />
        </TimeScale>
        <BaselineSeries
          data={seriesData.map(d => ({ time: d.time, value: d.close }))}
          options={{
            lineWidth: 2,
            priceLineVisible: false,
            baseValue: {
              type: "price",
              price: seriesData[0].close,
            },
          }}
          crosshairPosition={crosshairPosition}
        />
        <PriceLine price={seriesData[0].close} options={{ color: colors.blue }} />
      </Chart>
    </ChartWidgetCard>
  );
};

export { SyncingCharts };
