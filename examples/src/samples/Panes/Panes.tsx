import { Checkbox, FormControlLabel, FormGroup, useTheme } from "@mui/material";
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
import { ohlcData, rsiData, usePanesControlsStore, volumeData } from "./panesStore";
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
          color: `${colors.blue}75`,
          fontSize: 24,
          fontFamily: theme.typography.fontFamily,
        },
      ]}
      horzAlign="center"
      vertAlign="center"
    />
  );
};

const Panes = () => {
  const { volumesVisible, rsiVisible, setRsiVisible, setVolumesVisible } =
    usePanesControlsStore();

  return (
    <ChartWidgetCard
      title="Panes"
      subTitle="Multiple panes on the same chart"
      sampleConfig={samplesLinks.Panes}
    >
      <FormGroup sx={{ marginBottom: 2, flexDirection: "row", gap: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={rsiVisible}
              onChange={e => setRsiVisible(e.target.checked)}
              slotProps={{ input: { "aria-label": "controlled" } }}
            />
          }
          label="Show RSI"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={volumesVisible}
              onChange={e => setVolumesVisible(e.target.checked)}
              slotProps={{ input: { "aria-label": "controlled" } }}
            />
          }
          label="Show Volume"
        />
      </FormGroup>
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
        <Pane paneIndex={0} height={100}>
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
          <Watermark text="0" />
        </Pane>
        {rsiVisible && (
          <Pane paneIndex={1}>
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
            <Watermark text="1" />
          </Pane>
        )}
        {volumesVisible && (
          <Pane paneIndex={2}>
            <HistogramSeries
              data={volumeData}
              options={{
                priceLineVisible: false,
              }}
            />
            <Watermark text="2" />
          </Pane>
        )}
      </Chart>
    </ChartWidgetCard>
  );
};

export { Panes };
