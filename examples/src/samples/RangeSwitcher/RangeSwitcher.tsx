import { chartCommonOptions } from "@/common/chartCommonOptions";
import { ChartWidgetCard } from "@/ui/ChartWidgetCard";
import { Button, ButtonGroup } from "@mui/material";
import { AreaSeries, Chart } from "lightweight-charts-react-components";
import {
  dataRangeMap,
  useDataRangeStore,
  useSeriesDataStore,
} from "./rangeSwitcherStore";
import { typedObjectKeys } from "@/common/utils";
import { AreaSeriesOptions, DeepPartial } from "lightweight-charts";
import { colors } from "@/colors";

const seriesCustomOptions = {
  bottomColor: `${colors.blue}05`,
  lineColor: colors.cyan,
  topColor: colors.cyan,
} satisfies DeepPartial<AreaSeriesOptions>;

const RangeSwitcher = () => {
  const { range, setRange } = useDataRangeStore();
  const { data } = useSeriesDataStore();

  return (
    <ChartWidgetCard
      title="Range switcher"
      subTitle="Allows user to switch between different time ranges"
    >
      <ButtonGroup
        variant="outlined"
        aria-label="Basic button group"
        color="info"
      >
        {typedObjectKeys(dataRangeMap).map((key) => (
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
        height={400}
        localization={{
          timeFormatter: dataRangeMap[range],
        }}
        {...chartCommonOptions}
        autoSize
      >
        <AreaSeries reactive options={seriesCustomOptions} data={data} />
      </Chart>
    </ChartWidgetCard>
  );
};

export { RangeSwitcher };
