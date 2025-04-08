import { Chart } from "lightweight-charts-react-components";
import { chartCommonOptions } from "@/common/chartCommonOptions";
import { samplesLinks } from "@/samples";
import { ChartWidgetCard } from "../../ui/ChartWidgetCard";

const Scales = () => {
  return (
    <ChartWidgetCard
      title="Tooltips"
      subTitle="Different tooltips on the chart"
      githubLink={samplesLinks.Scales.github}
    >
      <Chart height={400} {...chartCommonOptions}></Chart>
    </ChartWidgetCard>
  );
};

export { Scales };
