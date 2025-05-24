import {
  Chart,
  LineSeries,
  SeriesPrimitive,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import { useCallback } from "react";
import { colors } from "@/colors";
import { chartCommonOptions } from "@/common/chartCommonOptions";
import { samplesLinks } from "@/samples";
import { ChartWidgetCard } from "@/ui/ChartWidgetCard";
import { ScrollableContainer } from "@/ui/ScrollableContainer";
import { VerticalLine } from "./primitives/VerticalLine";
import { areaSeries } from "./primitivesStore";
import type { RenderPrimitve } from "lightweight-charts-react-components";

const Primitives = () => {
  const renderVertLine: RenderPrimitve = useCallback(() => new VerticalLine("", {}), []);

  return (
    <ChartWidgetCard
      title="Primitives"
      subTitle="Various primitives display on the chart"
      sampleConfig={samplesLinks.Primitives}
    >
      <ScrollableContainer sx={{ marginBottom: 2 }}>children</ScrollableContainer>
      <Chart options={chartCommonOptions} containerProps={{ style: { flexGrow: "1" } }}>
        <LineSeries
          data={areaSeries}
          options={{
            lineWidth: 3,
            color: colors.violet,
            priceLineVisible: false,
          }}
        >
          <SeriesPrimitive render={renderVertLine} />
        </LineSeries>
        <TimeScale>
          <TimeScaleFitContentTrigger deps={[]} />
        </TimeScale>
      </Chart>
    </ChartWidgetCard>
  );
};

export { Primitives };
