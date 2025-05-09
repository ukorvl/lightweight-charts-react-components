import { Chip } from "@mui/material";
import { CrosshairMode } from "lightweight-charts";
import {
  AreaSeries,
  Chart,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import { colors } from "@/colors";
import { withChartCommonOptions } from "@/common/chartCommonOptions";
import { typedObjectEntries } from "@/common/utils";
import { samplesLinks } from "@/samples";
import { ScrollableContainer } from "@/ui/ScrollableContainer";
import { mainSeriesData, seriesMap, useCompareSeriesStore } from "./compareSeriesStore";
import { ChartWidgetCard } from "../../ui/ChartWidgetCard";
import type { FC } from "react";

type ChipProps = {
  label: string;
  selected?: boolean;
  color?: string;
  onClick?: () => void;
};

const StyledChip: FC<ChipProps> = ({ label, selected, onClick, color }) => {
  return (
    <Chip
      label={label}
      variant={selected ? "filled" : "outlined"}
      onClick={onClick}
      tabIndex={onClick ? 0 : -1}
      sx={{
        backgroundColor: selected ? color : "transparent",
        borderColor: color,
        color: selected ? colors.white : color,
        "&:hover": {
          backgroundColor: selected ? color : "transparent",
        },
        ...(onClick
          ? {
              "&:focus": {
                outline: `2px solid ${color}`,
              },
            }
          : {}),
      }}
    />
  );
};

const CompareSeries = () => {
  const { visibleSeries, toggleSeriesVisibility } = useCompareSeriesStore();
  const seriesMapEntries = typedObjectEntries(seriesMap);

  return (
    <ChartWidgetCard
      title="Compare series"
      subTitle="Compare different series and metrics on the same chart"
      sampleConfig={samplesLinks.CompareSeries}
    >
      <ScrollableContainer sx={{ marginBottom: 2, paddingBlock: 1 }}>
        <StyledChip label="Asset A" color={colors.blue100} selected />
        {seriesMapEntries.map(([key, { chipColor }]) => {
          return (
            <StyledChip
              key={key}
              label={key}
              color={chipColor}
              selected={visibleSeries.includes(key)}
              onClick={() => toggleSeriesVisibility(key)}
            />
          );
        })}
      </ScrollableContainer>
      <Chart
        options={withChartCommonOptions({
          crosshair: {
            mode: CrosshairMode.Normal,
          },
        })}
        containerProps={{ style: { flexGrow: "1" } }}
      >
        <AreaSeries
          data={mainSeriesData}
          options={{
            topColor: colors.blue100,
            bottomColor: `${colors.blue100}10`,
            lineColor: colors.blue100,
            lineWidth: 2,
          }}
        />
        {seriesMapEntries
          .filter(([key]) => visibleSeries.includes(key))
          .map(([key, { Component, data, options }]) => {
            return <Component key={key} data={data} options={options} />;
          })}
        <TimeScale>
          <TimeScaleFitContentTrigger deps={[]} />
        </TimeScale>
      </Chart>
    </ChartWidgetCard>
  );
};

export { CompareSeries };
