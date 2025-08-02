import { withChartCommonOptions } from "@/common/chartCommonOptions";
import { Chart as ChartComponent } from "lightweight-charts-react-components";

const Chart = () => {
  return (
    <ChartComponent
      options={withChartCommonOptions({})}
      containerProps={{ style: { flexGrow: "1" } }}
    ></ChartComponent>
  );
};

export { Chart };
