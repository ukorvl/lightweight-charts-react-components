import { useTheme } from "@mui/material";
import {
  CandlestickSeries,
  Chart,
  HistogramSeries,
  LineSeries,
  PriceLine,
  TimeScale,
  TimeScaleFitContentTrigger,
  Pane,
  WatermarkText,
} from "lightweight-charts-react-components";
import { colors } from "@/colors";
import { withChartCommonOptions } from "@/common/chartCommonOptions";
import { samplesLinks } from "@/samples";
import { ohlcData, rsiData, volumeData } from "./panesData";
import { ChartWidgetCard } from "../../ui/ChartWidgetCard";

type WatermarkProps = {
  text: string;
};

const Watermark = ({ text }: WatermarkProps) => {
  const theme = useTheme();

  return (
    <WatermarkText
      lines={[
        {
          text,
          color: `${colors.blue}90`,
          fontSize: 12,
          fontFamily: theme.typography.fontFamily,
        },
      ]}
      horzAlign="center"
      vertAlign="center"
    />
  );
};

const Panes = () => {
  return (
    <ChartWidgetCard
      title="Panes"
      subTitle="Multiple panes on the same chart"
      sampleConfig={samplesLinks.Panes}
    >
      <Chart
        options={withChartCommonOptions({
          layout: {
            panes: {
              enableResize: true,
              separatorColor: colors.gray100,
            },
          },
        })}
        containerProps={{ style: { flexGrow: "1" } }}
      >
        <TimeScale>
          <TimeScaleFitContentTrigger deps={[]} />
        </TimeScale>
        <Pane stretchFactor={3}>
          <CandlestickSeries
            data={ohlcData}
            options={{
              upColor: "transparent",
              downColor: colors.orange100,
              borderUpColor: colors.blue,
              borderDownColor: colors.orange100,
              wickUpColor: colors.blue,
              wickDownColor: colors.orange100,
              priceLineVisible: false,
            }}
          />
        </Pane>
        <Pane stretchFactor={1}>
          <LineSeries
            data={rsiData}
            options={{
              priceLineVisible: false,
              color: colors.blue100,
              lineWidth: 2,
              priceScaleId: "right",
            }}
          >
            <PriceLine
              price={70}
              options={{
                color: colors.violet,
                lineWidth: 1,
                lineStyle: 3,
                axisLabelVisible: true,
              }}
            />
            <PriceLine
              price={30}
              options={{
                color: colors.violet,
                lineWidth: 1,
                lineStyle: 3,
                axisLabelVisible: true,
              }}
            />
          </LineSeries>
          <Watermark text="RSI-14" />
        </Pane>
        <Pane stretchFactor={1}>
          <HistogramSeries
            data={volumeData}
            options={{
              priceLineVisible: false,
            }}
          />
          <Watermark text="VOLUME" />
        </Pane>
      </Chart>
    </ChartWidgetCard>
  );
};

export { Panes };
