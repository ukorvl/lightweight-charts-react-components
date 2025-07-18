import {
  Box,
  FormControlLabel,
  FormGroup,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { CrosshairMode } from "lightweight-charts";
import { colors } from "@/colors";
import { withChartCommonOptions } from "@/common/chartCommonOptions";
import { samplesLinks } from "@/samples";
import { ChartWidgetCard } from "@/ui/ChartWidgetCard";
import {
  CandlestickSeries,
  Chart,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import { useLegendStore } from "./legendStore";
import { seriesData, useLegend } from "./useLegend";
import type { FC, ReactNode } from "react";

type LegendProps = {
  children: ReactNode;
};

const Legend: FC<LegendProps> = ({ children }) => {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        backgroundColor: `${colors.blue200}95`,
        padding: 2,
        zIndex: 10,
      }}
    >
      {children}
    </Box>
  );
};

const WithLegend = () => {
  const { legendVisible, setLegendVisible } = useLegendStore();
  const { ref, legendData, onCrosshairMove } = useLegend(legendVisible);

  return (
    <ChartWidgetCard
      title="Legend"
      subTitle="Display legend on the chart"
      sampleConfig={samplesLinks.Legend}
    >
      <FormGroup sx={{ marginBottom: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={legendVisible}
              onChange={() => setLegendVisible(!legendVisible)}
              slotProps={{ input: { "aria-label": "controlled" } }}
            />
          }
          label="Show legend"
        />
      </FormGroup>
      <Box height="100%" flexDirection="column" position="relative">
        <Chart
          options={withChartCommonOptions({
            crosshair: { mode: CrosshairMode.Normal },
          })}
          containerProps={{ style: { height: "100%" } }}
          onCrosshairMove={onCrosshairMove}
        >
          <CandlestickSeries
            ref={ref}
            data={seriesData}
            options={{
              upColor: colors.green,
              downColor: colors.red,
              borderUpColor: colors.green,
              borderDownColor: colors.red,
              wickUpColor: colors.green,
              wickDownColor: colors.red,
            }}
          />
          <TimeScale>
            <TimeScaleFitContentTrigger deps={[]} />
          </TimeScale>
        </Chart>
        {legendData !== null && legendVisible && (
          <Legend>
            <Typography variant="h6" gutterBottom>
              Your awesome chart legend
            </Typography>
            <Typography variant="body2">{legendData.time}</Typography>
            <Stack direction="row" useFlexGap gap={1.2}>
              <Typography variant="overline">
                O:{" "}
                <Typography color={legendData.color} variant="overline">
                  {legendData.open}
                </Typography>
              </Typography>
              <Typography variant="overline">
                H:{" "}
                <Typography color={legendData.color} variant="overline">
                  {legendData.high}
                </Typography>
              </Typography>
              <Typography variant="overline">
                L:{" "}
                <Typography color={legendData.color} variant="overline">
                  {legendData.low}
                </Typography>
              </Typography>
              <Typography variant="overline">
                C:{" "}
                <Typography color={legendData.color} variant="overline">
                  {legendData.close}
                </Typography>
              </Typography>
              <Typography color={legendData.color} variant="overline">
                {legendData.change}
              </Typography>
            </Stack>
          </Legend>
        )}
      </Box>
    </ChartWidgetCard>
  );
};

export { WithLegend };
