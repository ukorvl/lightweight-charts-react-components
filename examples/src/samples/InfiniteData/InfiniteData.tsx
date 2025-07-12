import { debounce, useTheme } from "@mui/material";
import { useCallback, useMemo } from "react";
import { colors } from "@/colors";
import { withChartCommonOptions } from "@/common/chartCommonOptions";
import { samplesLinks } from "@/samples";
import {
  Chart,
  LineSeries,
  Pane,
  TimeScale,
  TimeScaleFitContentTrigger,
  WatermarkText,
} from "lightweight-charts-react-components";
import { useInfiniteDataStore } from "./infiniteDataStore";
import { ChartWidgetCard } from "../../ui/ChartWidgetCard";
import type { LogicalRange, LogicalRangeChangeEventHandler } from "lightweight-charts";

const InfiniteData = () => {
  const { data, loading, fetchMoreData } = useInfiniteDataStore();
  const theme = useTheme();

  const debouncedFetchMore = useMemo(
    () =>
      debounce((r: LogicalRange) => {
        const { from } = r;
        fetchMoreData(Math.floor(50 - from));
      }, 150),
    [fetchMoreData]
  );

  const onVisibleLogicalRangeChange: LogicalRangeChangeEventHandler = useCallback(
    r => {
      if (loading || !r) return;

      if (r.from < 5) {
        debouncedFetchMore(r);
      }
    },
    [debouncedFetchMore, loading]
  );

  const chartOptions = useMemo(
    () =>
      withChartCommonOptions(
        loading
          ? {
              layout: {
                background: {
                  color: `${colors.gray}05`,
                },
                textColor: colors.gray,
              },
            }
          : {}
      ),
    [withChartCommonOptions, loading]
  );

  return (
    <ChartWidgetCard
      title="Infinite data"
      subTitle="Load more data on scroll"
      sampleConfig={samplesLinks.InfiniteData}
    >
      <Chart options={chartOptions} containerProps={{ style: { flexGrow: "1" } }}>
        <Pane>
          <LineSeries data={data} options={{ color: colors.green }} />
          <TimeScale
            options={{
              barSpacing: 10,
              fixRightEdge: true,
            }}
            onVisibleLogicalRangeChange={onVisibleLogicalRangeChange}
          >
            <TimeScaleFitContentTrigger deps={[]} />
          </TimeScale>
          <WatermarkText
            visible={loading}
            lines={[
              {
                text: "Loading more data...",
                color: `${colors.gray}75`,
                fontSize: 32,
                fontFamily: theme.typography.fontFamily,
              },
            ]}
          />
        </Pane>
      </Chart>
    </ChartWidgetCard>
  );
};

export { InfiniteData };
