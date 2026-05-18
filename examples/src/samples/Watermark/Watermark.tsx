import { Tab, Tabs } from "@mui/material";
import { chartCommonOptions } from "@/common/chartCommonOptions";
import { colors } from "@/common/colors";
import { samplesLinks } from "@/samples";
import { ChartWidgetCard } from "@/ui/ChartWidgetCard";
import { getTabA11yProps, TabPanel } from "@/ui/TabPanel";
import {
  AreaSeries,
  Chart,
  Pane,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import { useWatermarkStore, seriesData, useWatermarkComponent } from "./watermarkStore";

const Watermark = () => {
  const { visibleWatermark, setWatermarkVisible } = useWatermarkStore();
  const WatermarkComponent = useWatermarkComponent(visibleWatermark);

  return (
    <ChartWidgetCard
      title="Watermark"
      subTitle="Text and image watermarks on the chart"
      sampleConfig={samplesLinks.Watermark}
    >
      <Tabs
        value={visibleWatermark}
        onChange={(_, newVal) => setWatermarkVisible(newVal)}
        aria-label="watermark tabs"
        sx={{ marginBottom: 2 }}
      >
        {["text", "image"].map(key => (
          <Tab key={key} value={key} label={key} {...getTabA11yProps("watermark", key)} />
        ))}
      </Tabs>
      <TabPanel sampleId="watermark" tabValue={visibleWatermark}>
        <Chart options={chartCommonOptions} containerProps={{ style: { flexGrow: "1" } }}>
          <Pane>
            <AreaSeries
              data={seriesData}
              options={{
                lineWidth: 1,
                lineColor: colors.pink,
                topColor: colors.pink,
                bottomColor: colors.blue200,
              }}
            />
            <WatermarkComponent />
          </Pane>
          <TimeScale>
            <TimeScaleFitContentTrigger deps={[]} />
          </TimeScale>
        </Chart>
      </TabPanel>
    </ChartWidgetCard>
  );
};

export { Watermark };
