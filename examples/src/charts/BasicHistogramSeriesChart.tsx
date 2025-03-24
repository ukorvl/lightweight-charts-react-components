import { Chart, HistogramSeries } from "lightweight-charts-react-components";
import { chartCommonSettings } from "./common/chartsSettings";
import { HistogramData } from "lightweight-charts";

const BasicHistogramSeriesChart = () => {
  return (
    <Chart height={400} {...chartCommonSettings}>
      <HistogramSeries data={mockHistogramSeriesData} />
    </Chart>
  );
};

export { BasicHistogramSeriesChart };

const mockHistogramSeriesData: HistogramData[] = [
    { time: "2024-03-01", value: 200, color: "green" },
    { time: "2024-03-02", value: 202.5, color: "green" },
    { time: "2024-03-03", value: 198, color: "red" },
    { time: "2024-03-04", value: 205, color: "green" },
    { time: "2024-03-05", value: 210, color: "green" },
    { time: "2024-03-06", value: 195, color: "red" },
    { time: "2024-03-07", value: 192, color: "red" },
    { time: "2024-03-08", value: 198, color: "green" },
    { time: "2024-03-09", value: 190, color: "red" },
    { time: "2024-03-10", value: 195, color: "green" },
    { time: "2024-03-11", value: 185, color: "red" },
    { time: "2024-03-12", value: 190, color: "green" },
    { time: "2024-03-13", value: 200, color: "green" },
    { time: "2024-03-14", value: 210, color: "green" },
    { time: "2024-03-15", value: 205, color: "red" },
    { time: "2024-03-16", value: 208, color: "green" },
    { time: "2024-03-17", value: 202, color: "red" },
    { time: "2024-03-18", value: 215, color: "green" },
    { time: "2024-03-19", value: 220, color: "green" },
    { time: "2024-03-20", value: 218, color: "red" },
    { time: "2024-03-21", value: 230, color: "green" },
    { time: "2024-03-22", value: 225, color: "red" },
    { time: "2024-03-23", value: 235, color: "green" },
    { time: "2024-03-24", value: 240, color: "green" },
    { time: "2024-03-25", value: 245, color: "green" },
    { time: "2024-03-26", value: 238, color: "red" },
    { time: "2024-03-27", value: 242, color: "green" },
    { time: "2024-03-28", value: 248, color: "green" },
    { time: "2024-03-29", value: 250, color: "green" },
    { time: "2024-03-30", value: 255, color: "green" },
    { time: "2024-03-31", value: 260, color: "green" },
    { time: "2024-04-01", value: 250, color: "red" },
    { time: "2024-04-02", value: 245, color: "red" },
    { time: "2024-04-03", value: 255, color: "green" },
    { time: "2024-04-04", value: 265, color: "green" },
    { time: "2024-04-05", value: 270, color: "green" },
    { time: "2024-04-06", value: 275, color: "green" },
    { time: "2024-04-07", value: 268, color: "red" },
    { time: "2024-04-08", value: 272, color: "green" },
];
