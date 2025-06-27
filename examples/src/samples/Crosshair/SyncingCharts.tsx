import { CrosshairMode } from "lightweight-charts";
import {
  CandlestickSeries,
  Chart,
  HistogramSeries,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import { colors } from "@/colors";
import { withChartCommonOptions } from "@/common/chartCommonOptions";
import {
  generateOHLCData,
  generateVolumeDataFromOHLC,
} from "@/common/generateSeriesData";
import { samplesLinks } from "@/samples";
import { useSyncCharts } from "./useSyncCharts";
import { ChartWidgetCard } from "../../ui/ChartWidgetCard";

const ohlcData = generateOHLCData(70);
const volumeData = generateVolumeDataFromOHLC(ohlcData, {
  upColor: colors.orange,
  downColor: colors.blue100,
});

const SyncingCharts = () => {
  const {
    series1Ref,
    series2Ref,
    visibleLogicalRange,
    onVisibleLogicalRangeChange,
    onChart1CrosshairMove,
    onChart2CrosshairMove,
    chart1Cp,
    chart2Cp,
  } = useSyncCharts();

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
            vertLine: {
              style: 0,
              color: colors.blue,
            },
            horzLine: {
              style: 0,
              color: colors.blue,
            },
          },
          timeScale: {
            visible: false,
          },
          rightPriceScale: {
            minimumWidth: 75,
            scaleMargins: {
              top: 0,
              bottom: 0.1,
            },
          },
        })}
        containerProps={{
          style: { flexBasis: "50%", borderBottom: `1px solid ${colors.gray100}` },
        }}
        onCrosshairMove={onChart1CrosshairMove}
      >
        <TimeScale
          onVisibleLogicalRangeChange={onVisibleLogicalRangeChange}
          visibleLogicalRange={visibleLogicalRange}
        >
          <TimeScaleFitContentTrigger deps={[]} />
        </TimeScale>
        <CandlestickSeries
          data={ohlcData}
          options={{
            upColor: colors.green,
            downColor: colors.red,
            borderUpColor: colors.green,
            borderDownColor: colors.red,
            wickUpColor: colors.green,
            wickDownColor: colors.red,
            priceLineVisible: false,
          }}
          ref={series1Ref}
          crosshairPosition={chart1Cp}
        />
      </Chart>
      <Chart
        options={withChartCommonOptions({
          crosshair: {
            mode: CrosshairMode.Normal,
            vertLine: {
              style: 0,
              color: colors.blue,
            },
            horzLine: {
              style: 0,
              color: colors.blue,
            },
          },
          rightPriceScale: {
            minimumWidth: 75,
            scaleMargins: {
              top: 0.25,
              bottom: 0,
            },
          },
        })}
        containerProps={{ style: { flexBasis: "50%" } }}
        onCrosshairMove={onChart2CrosshairMove}
      >
        <TimeScale
          onVisibleLogicalRangeChange={onVisibleLogicalRangeChange}
          visibleLogicalRange={visibleLogicalRange}
        >
          <TimeScaleFitContentTrigger deps={[]} />
        </TimeScale>
        <HistogramSeries
          data={volumeData}
          ref={series2Ref}
          crosshairPosition={chart2Cp}
          options={{
            priceLineVisible: false,
          }}
        />
      </Chart>
    </ChartWidgetCard>
  );
};

export { SyncingCharts };
