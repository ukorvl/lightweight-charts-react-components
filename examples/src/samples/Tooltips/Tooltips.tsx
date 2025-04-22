import { Circle } from "@mui/icons-material";
import { Box, Grow, Stack, Tab, Tabs, Typography } from "@mui/material";
import { Chart, LineSeries } from "lightweight-charts-react-components";
import { useMemo, useRef } from "react";
import { colors } from "@/colors";
import { withChartCommonOptions } from "@/common/chartCommonOptions";
import { typedObjectKeys } from "@/common/utils";
import { samplesLinks } from "@/samples";
import { useBasicTooltip, useMultipleSeriesTooltip } from "./hooks";
import { basicTooltipSeriesData, multipleSeriesData, useTabStore } from "./tooltipsStore";
import { ChartWidgetCard } from "../../ui/ChartWidgetCard";
import type { TooltipType } from "./tooltipsStore";
import type { SxProps } from "@mui/material";
import type { SeriesApiRef } from "lightweight-charts-react-components";
import type { ComponentType, FC, ReactNode, RefObject } from "react";

type TooltipProps = {
  x: number | null;
  y: number | null;
  show: boolean;
  children: ReactNode;
  ariaLabel: string;
  width: number;
  height: number;
  sx?: SxProps;
};

const Tooltip: FC<TooltipProps> = ({
  show,
  x,
  y,
  children,
  ariaLabel,
  width,
  height,
  sx,
}) => {
  return (
    <Grow in={show} timeout={{ enter: 400 }}>
      <Box
        role="tooltip"
        aria-live="polite"
        aria-atomic="true"
        aria-label={ariaLabel}
        sx={{
          width: `${width}px`,
          height: `${height}px`,
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 1,
          paddingBlock: 2,
          paddingInline: 3,
          boxShadow: 2,
          zIndex: 10,
          top: y,
          left: x,
          ...sx,
        }}
      >
        {children}
      </Box>
    </Grow>
  );
};

const BasicTooltipChart = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipWidth = 120;
  const tooltipHeight = 60;
  const basicTooltipOpts = useMemo(
    () => ({
      tooltipHeight,
      tooltipWidth,
      yOffset: 12,
      xOffset: 12,
    }),
    [tooltipHeight, tooltipWidth]
  );
  const {
    onCrosshairMove,
    tooltipData: { time, price, position, show },
    seriesRef,
  } = useBasicTooltip(containerRef, basicTooltipOpts);

  return (
    <Chart
      ref={containerRef}
      options={withChartCommonOptions({
        crosshair: {
          vertLine: {
            style: 0,
            color: colors.blue,
          },
          horzLine: {
            style: 0,
            color: colors.blue,
          },
        },
      })}
      containerProps={{ style: { flexGrow: "1", position: "relative" } }}
      onCrosshairMove={onCrosshairMove}
    >
      <LineSeries
        ref={seriesRef}
        data={basicTooltipSeriesData}
        options={{
          color: colors.orange,
          lineWidth: 2,
        }}
      />
      <Tooltip
        show={show}
        x={position.x}
        y={position.y}
        ariaLabel={`Tooltip with chart data for time ${time} is ${price}`}
        width={tooltipWidth}
        height={tooltipHeight}
        sx={{
          color: colors.white,
          backgroundColor: colors.violet,
        }}
      >
        <Typography fontSize={18} fontWeight="bold" aria-hidden>
          {price}
        </Typography>
        <Typography variant="caption" aria-hidden>
          {time}
        </Typography>
      </Tooltip>
    </Chart>
  );
};

const MultipleSeriesTooltipChart = () => {
  const refs: Array<RefObject<SeriesApiRef<"Line"> | null>> = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipWidth = 190;
  const tooltipHeight = 150;
  const multipleSeriesTooltipOpts = useMemo(
    () => ({
      tooltipHeight,
      tooltipWidth,
      yOffset: 12,
      xOffset: 12,
    }),
    [tooltipHeight, tooltipWidth]
  );
  const {
    onCrosshairMove,
    tooltipData: { time, data, position, show },
  } = useMultipleSeriesTooltip(containerRef, refs, multipleSeriesTooltipOpts);

  return (
    <Chart
      ref={containerRef}
      options={withChartCommonOptions({
        crosshair: {
          vertLine: {
            style: 0,
            color: colors.blue,
          },
          horzLine: {
            visible: false,
          },
        },
      })}
      containerProps={{ style: { flexGrow: "1", position: "relative" } }}
      onCrosshairMove={onCrosshairMove}
    >
      {multipleSeriesData.map(({ data, color }, index) => (
        <LineSeries
          key={index}
          ref={refs[index]}
          data={data}
          options={{
            color,
            lineWidth: 2,
            priceLineVisible: false,
          }}
        />
      ))}
      <Tooltip
        show={show}
        x={position.x}
        y={position.y}
        ariaLabel={`Tooltip with chart data for time ${time} is ${data}`}
        width={tooltipWidth}
        height={tooltipHeight}
        sx={{
          color: colors.blue200,
          backgroundColor: colors.white,
          alignItems: "flex-start",
        }}
      >
        {multipleSeriesData.map(({ color }, index) => (
          <Stack key={index} direction="row" gap="1ch" alignItems="center">
            <Circle sx={{ color, fontSize: "12px" }} />
            <Typography variant="body1" fontWeight="bold" aria-hidden>
              {`Asset ${String.fromCharCode(65 + index)}: ${data?.get(index) ?? "-"}`}
            </Typography>
          </Stack>
        ))}
        <Typography
          width="100%"
          textAlign="center"
          variant="caption"
          aria-hidden
          marginTop={1}
        >
          {time}
        </Typography>
      </Tooltip>
    </Chart>
  );
};

const tooltipMap: Record<TooltipType, ComponentType> = {
  Basic: BasicTooltipChart,
  "Multiple series": MultipleSeriesTooltipChart,
};

const Tooltips = () => {
  const { activeTab, setActiveTab } = useTabStore();
  const a11yProps = (key: string) => ({
    id: `tooltips-tab-${key}`,
    "aria-controls": `tooltips-tabpanel-${key}`,
  });
  const ChartComponent = tooltipMap[activeTab];

  return (
    <ChartWidgetCard
      title="Tooltips"
      subTitle="Different tooltips on the chart"
      githubLink={samplesLinks.Tooltips.github}
      codeSanboxLink={samplesLinks.Tooltips.codesandbox}
    >
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        aria-label="tooltips tabs"
        sx={{ marginBottom: 2 }}
        allowScrollButtonsMobile
        variant="scrollable"
        scrollButtons="auto"
      >
        {typedObjectKeys(tooltipMap).map(key => (
          <Tab key={key} value={key} label={key} {...a11yProps(key)} />
        ))}
      </Tabs>
      <ChartComponent />
    </ChartWidgetCard>
  );
};

export { Tooltips };
