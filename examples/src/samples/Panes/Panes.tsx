import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import {
  CandlestickSeries,
  Chart,
  HistogramSeries,
  LineSeries,
  Pane,
  PriceLine,
} from "lightweight-charts-react-components";
import { colors } from "@/colors";
import { withChartCommonOptions } from "@/common/chartCommonOptions";
import { samplesLinks } from "@/samples";
import { ohlcData, rsiData, usePanesControlsStore, volumeData } from "./panesStore";
import { ChartWidgetCard } from "../../ui/ChartWidgetCard";

const Panes = () => {
  const { volumesVisible, rsiVisible, setRsiVisible, setVolumesVisible } =
    usePanesControlsStore();

  return (
    <ChartWidgetCard
      title="Panes"
      subTitle="Multiple panes on the same chart"
      githubLink={samplesLinks.Panes.github}
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
        <Pane id={0}>
          <CandlestickSeries
            data={ohlcData}
            options={{
              upColor: "transparent",
              downColor: colors.orange100,
              borderUpColor: colors.blue,
              borderDownColor: colors.orange100,
              wickUpColor: colors.blue,
              wickDownColor: colors.orange100,
            }}
          />
        </Pane>
        {rsiVisible && (
          <Pane id={1} height={100}>
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
          </Pane>
        )}
        {volumesVisible && (
          <Pane id={2} height={75}>
            <HistogramSeries
              data={volumeData}
              options={{
                priceLineVisible: false,
              }}
            />
          </Pane>
        )}
      </Chart>
    </ChartWidgetCard>
  );
};

export { Panes };

//
//enable panes autores
// toggle visibility of rsi and volume panes
// buttons move pane up and move pane down (including chart itself). only pane in the middle has 2 enaled buttons
