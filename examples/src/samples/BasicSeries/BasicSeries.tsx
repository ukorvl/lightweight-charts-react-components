import { chartCommonOptions } from "@/common/chartCommonOptions";
import { Tab, Tabs } from "@mui/material";
import { Chart } from "lightweight-charts-react-components";
import {
  basicSeriesMap,
  useSeriesStore,
  useTabStore,
} from "./basicSeriesStore";
import { ChartWidgetCard } from "../../ui/ChartWidgetCard";

const BasicSeries = () => {
  const { activeTab, setActiveTab } = useTabStore();
  const { seriesData, seriesComponent: Component } = useSeriesStore();

  const a11yProps = (key: string) => ({
    id: `line-series-tab-${key}`,
    "aria-controls": `basic-series-tabpanel-${key}`,
  });

  return (
    <ChartWidgetCard
      title="Basic series"
      subTitle="Examples of different types series basic usage"
    >
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        aria-label="basic series tabs"
      >
        {Array.from(basicSeriesMap).map(([key]) => (
          <Tab key={key} value={key} label={key} {...a11yProps(key)} />
        ))}
      </Tabs>
      <Chart height={400} {...chartCommonOptions} autoSize>
        {Component && <Component data={seriesData} />}
      </Chart>
    </ChartWidgetCard>
  );
};

export { BasicSeries };
