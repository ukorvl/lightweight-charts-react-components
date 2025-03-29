import { ChartWidgetCard } from "@/ui/ChartWidgetCard";
import {
  Chart,
  CustomSeries as CustomSeriesComponent,
} from "lightweight-charts-react-components";
import { GroupedBarsSeries } from "./plugin";
import { chartCommonOptions } from "@/common/chartCommonOptions";

const CustomSeries = () => {
  return (
    <ChartWidgetCard
      title="Custom series"
      subTitle="Example of custom series plugin usage (grouped bars)"
    >
      <Chart height={400} {...chartCommonOptions} autoSize>
        <CustomSeriesComponent
          data={[
            {
              values: [1, 2, 3],
              time: 1,
            },
            {
              values: [2, 3, 4],
              time: 2,
            },
            {
              values: [3, 4, 5],
              time: 3,
            },
          ]}
          plugin={new GroupedBarsSeries()}
        />
      </Chart>
    </ChartWidgetCard>
  );
};

export { CustomSeries };
