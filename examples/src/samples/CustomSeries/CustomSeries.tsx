import {
  Chart,
  CustomSeries as CustomSeriesComponent,
} from "lightweight-charts-react-components";
import { chartCommonOptions } from "@/common/chartCommonOptions";
import { samplesLinks } from "@/samples";
import { ChartWidgetCard } from "@/ui/ChartWidgetCard";
import { GroupedBarsSeries } from "./plugin";

const CustomSeries = () => {
  return (
    <ChartWidgetCard
      title="Custom series"
      subTitle="Custom series plugin usage (grouped bars)"
      githubLink={samplesLinks.CustomSeries.github}
    >
      <Chart options={chartCommonOptions} containerProps={{ style: { flexGrow: "1" } }}>
        <CustomSeriesComponent
          data={[
            {
              time: "2021-01-01",
              customValues: {
                values: [1, 2, 3],
              },
            },
            {
              time: "2021-01-02",
              customValues: {
                values: [2, 3, 4],
              },
            },
            {
              time: "2021-01-03",
              customValues: {
                values: [3, 4, 5],
              },
            },
          ]}
          plugin={new GroupedBarsSeries()}
        />
      </Chart>
    </ChartWidgetCard>
  );
};

export { CustomSeries };
