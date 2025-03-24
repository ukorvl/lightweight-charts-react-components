import { BaselineSeries, Chart } from "lightweight-charts-react-components";
import { chartCommonSettings } from "./common/chartsSettings";
import { BaselineData } from "lightweight-charts";

const BasicBaselineAreaSeriesChart = () => {
  return (
    <Chart height={400} {...chartCommonSettings}>
      <BaselineSeries
        data={baselineSeriesData}
        options={{ baseValue: { type: "price", price: 130 } }}
      />
    </Chart>
  );
};

export { BasicBaselineAreaSeriesChart };

const baselineSeriesData: BaselineData[] = [
  { time: "2024-03-01", value: 100 },
  { time: "2024-03-02", value: 105 },
  { time: "2024-03-03", value: 103 },
  { time: "2024-03-04", value: 108 },
  { time: "2024-03-05", value: 102 },
  { time: "2024-03-06", value: 98 },
  { time: "2024-03-07", value: 101 },
  { time: "2024-03-08", value: 107 },
  { time: "2024-03-09", value: 110 },
  { time: "2024-03-10", value: 108 },
  { time: "2024-03-11", value: 112 },
  { time: "2024-03-12", value: 117 },
  { time: "2024-03-13", value: 115 },
  { time: "2024-03-14", value: 113 },
  { time: "2024-03-15", value: 118 },
  { time: "2024-03-16", value: 120 },
  { time: "2024-03-17", value: 125 },
  { time: "2024-03-18", value: 123 },
  { time: "2024-03-19", value: 121 },
  { time: "2024-03-20", value: 126 },
  { time: "2024-03-21", value: 129 },
  { time: "2024-03-22", value: 127 },
  { time: "2024-03-23", value: 131 },
  { time: "2024-03-24", value: 134 },
  { time: "2024-03-25", value: 130 },
  { time: "2024-03-26", value: 128 },
  { time: "2024-03-27", value: 135 },
  { time: "2024-03-28", value: 138 },
  { time: "2024-03-29", value: 140 },
  { time: "2024-03-30", value: 137 },
  { time: "2024-03-31", value: 142 },
  { time: "2024-04-01", value: 145 },
  { time: "2024-04-02", value: 148 },
  { time: "2024-04-03", value: 146 },
  { time: "2024-04-04", value: 144 },
  { time: "2024-04-05", value: 150 },
  { time: "2024-04-06", value: 155 },
  { time: "2024-04-07", value: 152 },
  { time: "2024-04-08", value: 158 },
];
