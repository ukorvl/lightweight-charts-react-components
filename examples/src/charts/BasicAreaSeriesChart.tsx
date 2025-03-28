import { AreaSeries, Chart } from "lightweight-charts-react-components";
import { chartCommonSettings } from "./common/chartsSettings";
import { AreaData } from "lightweight-charts";

const BasicAreaSeriesChart = () => {
  return (
    <Chart height={400} {...chartCommonSettings}>
      <AreaSeries data={mockAreaSeriesData} />
    </Chart>
  );
};

export { BasicAreaSeriesChart };

const mockAreaSeriesData: AreaData[] = [
  { time: "2024-03-01", value: 100 },
  { time: "2024-03-02", value: 102 },
  { time: "2024-03-03", value: 98 },
  { time: "2024-03-04", value: 105 },
  { time: "2024-03-05", value: 107 },
  { time: "2024-03-06", value: 110 },
  { time: "2024-03-07", value: 108 },
  { time: "2024-03-08", value: 115 },
  { time: "2024-03-09", value: 120 },
  { time: "2024-03-10", value: 125 },
  { time: "2024-03-11", value: 130 },
  { time: "2024-03-12", value: 128 },
  { time: "2024-03-13", value: 135 },
  { time: "2024-03-14", value: 138 },
  { time: "2024-03-15", value: 140 },
  { time: "2024-03-16", value: 142 },
  { time: "2024-03-17", value: 145 },
  { time: "2024-03-18", value: 147 },
  { time: "2024-03-19", value: 150 },
  { time: "2024-03-20", value: 152 },
  { time: "2024-03-21", value: 155 },
  { time: "2024-03-22", value: 157 },
  { time: "2024-03-23", value: 160 },
  { time: "2024-03-24", value: 165 },
  { time: "2024-03-25", value: 170 },
  { time: "2024-03-26", value: 175 },
  { time: "2024-03-27", value: 180 },
  { time: "2024-03-28", value: 185 },
  { time: "2024-03-29", value: 190 },
  { time: "2024-03-30", value: 195 },
  { time: "2024-03-31", value: 200 },
  { time: "2024-04-01", value: 205 },
  { time: "2024-04-02", value: 210 },
  { time: "2024-04-03", value: 215 },
  { time: "2024-04-04", value: 220 },
  { time: "2024-04-05", value: 225 },
  { time: "2024-04-06", value: 220 },
  { time: "2024-04-07", value: 205 },
  { time: "2024-04-08", value: 210 },
  { time: "2024-04-09", value: 215 },
  { time: "2024-04-10", value: 220 },
];
