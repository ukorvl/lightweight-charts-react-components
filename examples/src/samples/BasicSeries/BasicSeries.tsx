import { chartCommonOptions } from "@/common/chartCommonOptions";
import { Tab, Tabs } from "@mui/material";
import { Chart } from "lightweight-charts-react-components";
import { basicSeriesMap, useSeriesStore, useTabStore } from "./basicSeriesStore";
import { ChartWidgetCard } from "../../ui/ChartWidgetCard";
import { samplesLinks } from "@/samples";
import { typedObjectKeys } from "@/common/utils";

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
      githubLink={samplesLinks.BasicSeries.githbub}
    >
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        aria-label="basic series tabs"
        sx={{ marginBottom: 2 }}
      >
        {typedObjectKeys(basicSeriesMap).map((key) => (
          <Tab key={key} value={key} label={key} {...a11yProps(key)} />
        ))}
      </Tabs>
      <Chart height={400} {...chartCommonOptions} autoSize>
        {Component && <Component data={seriesData} options={options} reactive={false} />}
      </Chart>
    </ChartWidgetCard>
  );
};

export { BasicSeries };
