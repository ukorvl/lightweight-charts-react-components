import { Tab, Tabs } from "@mui/material";
import { chartCommonOptions } from "@/common/chartCommonOptions";
import { typedObjectKeys } from "@/common/utils";
import { samplesLinks } from "@/samples";
import {
  Chart,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import { basicSeriesMap, useSeriesStore, useTabStore } from "./basicSeriesStore";
import { ChartWidgetCard } from "../../ui/ChartWidgetCard";

const BasicSeries = () => {
  const { activeTab, setActiveTab } = useTabStore();
  const { seriesData, seriesComponent: Component } = useSeriesStore();
  const options = basicSeriesMap[activeTab]?.options || {};

  const a11yProps = (key: string) => ({
    id: `line-series-tab-${key}`,
    "aria-controls": `basic-series-tabpanel-${key}`,
  });

  return (
    <ChartWidgetCard
      title="Basic series"
      subTitle="Different series types basic usage"
      sampleConfig={samplesLinks.BasicSeries}
    >
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        aria-label="basic series tabs"
        sx={{ marginBottom: 2 }}
        allowScrollButtonsMobile
        variant="scrollable"
        scrollButtons="auto"
      >
        {typedObjectKeys(basicSeriesMap).map(key => (
          <Tab key={key} value={key} label={key} {...a11yProps(key)} />
        ))}
      </Tabs>
      <Chart options={chartCommonOptions} containerProps={{ style: { flexGrow: "1" } }}>
        {Component && <Component data={seriesData} options={options} reactive={false} />}
        <TimeScale>
          <TimeScaleFitContentTrigger deps={[]} />
        </TimeScale>
      </Chart>
    </ChartWidgetCard>
  );
};

export { BasicSeries };
