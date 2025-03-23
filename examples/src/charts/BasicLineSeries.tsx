import { LineSeries, Chart } from "lightweight-charts-react-components";
import { chartCommonSettings } from "./common/chartsSettings";

const BasicLineSeries = () => {
  return (
    <Chart height={400} {...chartCommonSettings}>
      <LineSeries data={mockLineSeriesData} />
    </Chart>
  );
};

export { BasicLineSeries };

const mockLineSeriesData = [
  { time: "2024-02-10", value: 110.25 },
  { time: "2024-02-11", value: 115.4 },
  { time: "2024-02-12", value: 112.1 },
  { time: "2024-02-13", value: 118.75 },
  { time: "2024-02-14", value: 113.9 },
  { time: "2024-02-15", value: 120.3 },
  { time: "2024-02-16", value: 116.8 },
  { time: "2024-02-17", value: 122.5 },
  { time: "2024-02-18", value: 118.4 },
  { time: "2024-02-19", value: 124.9 },
  { time: "2024-02-20", value: 120.3 },
  { time: "2024-02-21", value: 127.6 },
  { time: "2024-02-22", value: 119.2 },
  { time: "2024-02-23", value: 125.5 },
  { time: "2024-02-24", value: 130.0 },
  { time: "2024-02-25", value: 122.8 },
  { time: "2024-02-26", value: 128.4 },
  { time: "2024-02-27", value: 121.9 },
  { time: "2024-02-28", value: 134.1 },
  { time: "2024-02-29", value: 124.7 },
  { time: "2024-03-01", value: 137.2 },
  { time: "2024-03-02", value: 127.9 },
  { time: "2024-03-03", value: 133.5 },
  { time: "2024-03-04", value: 126.0 },
  { time: "2024-03-05", value: 136.7 },
  { time: "2024-03-06", value: 130.9 },
  { time: "2024-03-07", value: 139.4 },
  { time: "2024-03-08", value: 132.8 },
  { time: "2024-03-09", value: 142.5 },
  { time: "2024-03-10", value: 129.3 },
  { time: "2024-03-11", value: 144.0 },
  { time: "2024-03-12", value: 135.5 },
  { time: "2024-03-13", value: 127.8 },
  { time: "2024-03-14", value: 140.9 },
  { time: "2024-03-15", value: 138.6 },
  { time: "2024-03-16", value: 132.2 },
  { time: "2024-03-17", value: 146.5 },
  { time: "2024-03-18", value: 128.9 },
  { time: "2024-03-19", value: 150.0 },
];
