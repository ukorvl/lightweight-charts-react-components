import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import { useCallback, useState } from "react";
import { withChartCommonOptions } from "@/common/chartCommonOptions";
import { colors } from "@/common/colors";
import { samplesLinks } from "@/samples";
import { ChartWidgetCard } from "@/ui/ChartWidgetCard";
import {
  CandlestickSeries,
  Chart,
  HistogramSeries,
  Pane,
  PanePrimitive,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import type { RenderPanePrimitive } from "lightweight-charts-react-components";
import { highlightBands, ohlcData, volumeData } from "./panePrimitivesData";
import { SessionHighlight } from "./primitives/SessionHighlight";

const PanePrimitives = () => {
  const [showOnPricePane, setShowOnPricePane] = useState(true);
  const [showOnVolumePane, setShowOnVolumePane] = useState(true);
  const theme = useTheme();

  const renderHighlightPrimitive: RenderPanePrimitive = useCallback(
    ({ chart, pane }) =>
      new SessionHighlight({
        bands: highlightBands,
        chart,
        pane,
        options: {
          labelFontFamily: theme.typography.fontFamily,
          labelTextColor: colors.white,
          zOrder: "bottom",
        },
      }),
    [theme.typography.fontFamily]
  );

  return (
    <ChartWidgetCard
      title="Pane primitives"
      subTitle="Pane-wide session bands and labels"
      sampleConfig={samplesLinks.PanePrimitives}
    >
      <FormGroup sx={{ marginBottom: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }}>
          <FormControlLabel
            control={
              <Switch
                checked={showOnPricePane}
                onChange={() => setShowOnPricePane(prevState => !prevState)}
              />
            }
            label="Highlight price pane"
          />
          <FormControlLabel
            control={
              <Switch
                checked={showOnVolumePane}
                onChange={() => setShowOnVolumePane(prevState => !prevState)}
              />
            }
            label="Highlight volume pane"
          />
        </Stack>
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
        <Pane stretchFactor={3}>
          <CandlestickSeries
            data={ohlcData}
            options={{
              upColor: "transparent",
              downColor: colors.orange100,
              borderUpColor: colors.blue100,
              borderDownColor: colors.orange100,
              wickUpColor: colors.blue100,
              wickDownColor: colors.orange100,
              priceLineVisible: false,
            }}
          />
          {showOnPricePane && <PanePrimitive render={renderHighlightPrimitive} />}
        </Pane>
        <Pane stretchFactor={1}>
          <HistogramSeries
            data={volumeData}
            options={{
              priceLineVisible: false,
              priceFormat: {
                type: "volume",
              },
            }}
          />
          {showOnVolumePane && <PanePrimitive render={renderHighlightPrimitive} />}
        </Pane>
        <TimeScale>
          <TimeScaleFitContentTrigger deps={[]} />
        </TimeScale>
      </Chart>
    </ChartWidgetCard>
  );
};

export { PanePrimitives };
