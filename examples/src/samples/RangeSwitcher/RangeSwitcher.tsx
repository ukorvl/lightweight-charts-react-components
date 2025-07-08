import { Button, ButtonGroup } from "@mui/material";
import { colors } from "@/colors";
import { withChartCommonOptions } from "@/common/chartCommonOptions";
import { typedObjectKeys } from "@/common/utils";
import { samplesLinks } from "@/samples";
import { ChartWidgetCard } from "@/ui/ChartWidgetCard";
import {
  AreaSeries,
  Chart,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import {
  dataRangeMap,
  useDataRangeStore,
  useSeriesDataStore,
} from "./rangeSwitcherStore";
import type { AreaSeriesOptions, DeepPartial } from "lightweight-charts";

const seriesCustomOptions = {
  bottomColor: `${colors.blue100}05`,
  lineColor: colors.cyan,
  topColor: colors.cyan,
  lineWidth: 2,
} satisfies DeepPartial<AreaSeriesOptions>;

const RangeSwitcher = () => {
  const { range, setRange } = useDataRangeStore();
  const { data } = useSeriesDataStore();

  return (
    <ChartWidgetCard
      title="Range switcher"
      subTitle="Allows user to switch between different time ranges"
      sampleConfig={samplesLinks.RangeSwitcher}
    >
      <ButtonGroup
        variant="outlined"
        aria-label="Basic button group"
        color="secondary"
        sx={{ marginBottom: 2 }}
      >
        {typedObjectKeys(dataRangeMap).map(key => (
          <Button
            key={key}
            onClick={() => setRange(key)}
            variant={range === key ? "contained" : "outlined"}
          >
            {key}
          </Button>
        ))}
      </ButtonGroup>
      <Chart
        options={withChartCommonOptions({
          localization: {
            timeFormatter: dataRangeMap[range].formatter,
          },
          timeScale: {
            tickMarkFormatter: dataRangeMap[range].formatter,
          },
        })}
        containerProps={{ style: { flexGrow: "1" } }}
      >
        <AreaSeries options={seriesCustomOptions} data={data} />
        <TimeScale>
          <TimeScaleFitContentTrigger deps={[]} />
        </TimeScale>
      </Chart>
    </ChartWidgetCard>
  );
};

export { RangeSwitcher };
