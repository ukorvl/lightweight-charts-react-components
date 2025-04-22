import { Tab, Tabs } from "@mui/material";
import { Chart } from "lightweight-charts-react-components";
import { chartCommonOptions } from "@/common/chartCommonOptions";
import { typedObjectKeys } from "@/common/utils";
import { samplesLinks } from "@/samples";
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
      githubLink={samplesLinks.BasicSeries.github}
      codeSanboxLink={samplesLinks.BasicSeries.codesandbox}
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
      </Chart>
    </ChartWidgetCard>
  );
};

export { BasicSeries };
