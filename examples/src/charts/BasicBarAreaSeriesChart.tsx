import { BarSeries, Chart } from "lightweight-charts-react-components";
import { chartCommonSettings } from "./common/chartsSettings";
import { BarData } from "lightweight-charts";

const BasicBarAreaSeriesChart = () => {
  return (
    <Chart height={400} {...chartCommonSettings}>
      <BarSeries data={barSeriesData} />
    </Chart>
  );
};

export { BasicBarAreaSeriesChart };

const barSeriesData: BarData[] = [
  { time: "2024-03-01", open: 100, high: 105, low: 98, close: 103 },
  { time: "2024-03-02", open: 103, high: 108, low: 102, close: 107 },
  { time: "2024-03-03", open: 107, high: 110, low: 104, close: 106 },
  { time: "2024-03-04", open: 106, high: 109, low: 103, close: 104 },
  { time: "2024-03-05", open: 104, high: 106, low: 100, close: 101 },
  { time: "2024-03-06", open: 101, high: 103, low: 97, close: 98 },
  { time: "2024-03-07", open: 98, high: 100, low: 95, close: 99 },
  { time: "2024-03-08", open: 99, high: 104, low: 98, close: 103 },
  { time: "2024-03-09", open: 103, high: 107, low: 101, close: 105 },
  { time: "2024-03-10", open: 105, high: 110, low: 104, close: 109 },
  { time: "2024-03-11", open: 109, high: 113, low: 108, close: 112 },
  { time: "2024-03-12", open: 112, high: 116, low: 111, close: 114 },
  { time: "2024-03-13", open: 114, high: 118, low: 112, close: 116 },
  { time: "2024-03-14", open: 116, high: 119, low: 114, close: 115 },
  { time: "2024-03-15", open: 115, high: 117, low: 112, close: 113 },
  { time: "2024-03-16", open: 113, high: 116, low: 110, close: 115 },
  { time: "2024-03-17", open: 115, high: 120, low: 114, close: 119 },
  { time: "2024-03-18", open: 119, high: 122, low: 118, close: 121 },
  { time: "2024-03-19", open: 121, high: 125, low: 120, close: 124 },
  { time: "2024-03-20", open: 124, high: 127, low: 122, close: 123 },
  { time: "2024-03-21", open: 123, high: 126, low: 121, close: 125 },
  { time: "2024-03-22", open: 125, high: 129, low: 124, close: 128 },
  { time: "2024-03-23", open: 128, high: 132, low: 127, close: 131 },
  { time: "2024-03-24", open: 131, high: 135, low: 130, close: 133 },
  { time: "2024-03-25", open: 133, high: 138, low: 132, close: 137 },
  { time: "2024-03-26", open: 137, high: 140, low: 135, close: 138 },
  { time: "2024-03-27", open: 138, high: 142, low: 136, close: 141 },
  { time: "2024-03-28", open: 141, high: 144, low: 139, close: 140 },
  { time: "2024-03-29", open: 140, high: 143, low: 137, close: 138 },
  { time: "2024-03-30", open: 138, high: 142, low: 136, close: 140 },
  { time: "2024-03-31", open: 140, high: 145, low: 138, close: 143 },
  { time: "2024-04-01", open: 143, high: 147, low: 141, close: 145 },
  { time: "2024-04-02", open: 145, high: 150, low: 144, close: 149 },
  { time: "2024-04-03", open: 149, high: 152, low: 146, close: 148 },
  { time: "2024-04-04", open: 148, high: 151, low: 144, close: 150 },
  { time: "2024-04-05", open: 150, high: 154, low: 148, close: 153 },
  { time: "2024-04-06", open: 153, high: 157, low: 152, close: 156 },
  { time: "2024-04-07", open: 156, high: 160, low: 154, close: 159 },
  { time: "2024-04-08", open: 159, high: 163, low: 157, close: 161 },
];
