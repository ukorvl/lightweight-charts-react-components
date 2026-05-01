import { Tab, Tabs } from "@mui/material";
import { useState, type ReactElement } from "react";
import { samplesLinks } from "@/samples";
import {
  AreaSeries,
  CustomChart,
  LineSeries,
  OptionsChart,
  TimeScale,
  TimeScaleFitContentTrigger,
  YieldCurveChart,
} from "lightweight-charts-react-components";
import {
  chartTypeTabs,
  customChartData,
  customChartOptions,
  customSeriesOptions,
  optionsChartData,
  optionsChartOptions,
  optionsSeriesOptions,
  quarterScaleBehavior,
  yieldCurveAreaData,
  yieldCurveAreaOptions,
  yieldCurveChartOptions,
  yieldCurveLineData,
  yieldCurveLineOptions,
  type ChartTypeTab,
} from "./chartTypesShared";
import { ChartWidgetCard } from "../../ui/ChartWidgetCard";
import type { Time } from "lightweight-charts";

const chartContainerProps = {
  style: {
    flexGrow: "1",
  },
} as const;

const OptionsChartExample = () => {
  return (
    <OptionsChart options={optionsChartOptions} containerProps={chartContainerProps}>
      <LineSeries
        data={optionsChartData}
        options={optionsSeriesOptions}
        reactive={false}
      />
      <TimeScale>
        <TimeScaleFitContentTrigger deps={[]} />
      </TimeScale>
    </OptionsChart>
  );
};

const YieldCurveChartExample = () => {
  return (
    <YieldCurveChart
      options={yieldCurveChartOptions}
      containerProps={chartContainerProps}
    >
      <AreaSeries
        data={yieldCurveAreaData}
        options={yieldCurveAreaOptions}
        reactive={false}
      />
      <LineSeries
        data={yieldCurveLineData}
        options={yieldCurveLineOptions}
        reactive={false}
      />
      <TimeScale>
        <TimeScaleFitContentTrigger deps={[]} />
      </TimeScale>
    </YieldCurveChart>
  );
};

const CustomChartExample = () => {
  return (
    <CustomChart<Time, typeof quarterScaleBehavior>
      horzScaleBehavior={quarterScaleBehavior}
      options={customChartOptions}
      containerProps={chartContainerProps}
    >
      <LineSeries data={customChartData} options={customSeriesOptions} reactive={false} />
      <TimeScale>
        <TimeScaleFitContentTrigger deps={[]} />
      </TimeScale>
    </CustomChart>
  );
};

const chartTypeComponentMap: Record<ChartTypeTab, () => ReactElement> = {
  Options: OptionsChartExample,
  "Yield curve": YieldCurveChartExample,
  Custom: CustomChartExample,
};

const ChartTypes = () => {
  const [activeTab, setActiveTab] = useState<ChartTypeTab>("Options");
  const ActiveChart = chartTypeComponentMap[activeTab];

  const a11yProps = (key: ChartTypeTab) => ({
    id: `chart-types-tab-${key}`,
    "aria-controls": `chart-types-tabpanel-${key}`,
  });

  return (
    <ChartWidgetCard
      title="Chart types"
      subTitle="Options, yield curve, and custom horizontal scale wrappers"
      sampleConfig={samplesLinks.ChartTypes}
    >
      <Tabs
        value={activeTab}
        onChange={(_, newValue: ChartTypeTab) => setActiveTab(newValue)}
        aria-label="chart types tabs"
        sx={{ marginBottom: 2 }}
        allowScrollButtonsMobile
        variant="scrollable"
        scrollButtons="auto"
      >
        {chartTypeTabs.map(key => (
          <Tab key={key} value={key} label={key} {...a11yProps(key)} />
        ))}
      </Tabs>
      <ActiveChart />
    </ChartWidgetCard>
  );
};

export { ChartTypes };
