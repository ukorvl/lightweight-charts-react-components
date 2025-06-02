import {
  Box,
  Button,
  ClickAwayListener,
  FormControl,
  FormLabel,
  Grow,
  MenuItem,
  Select,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Chart,
  LineSeries,
  SeriesPrimitive,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import { lazy, memo, useCallback, useRef, useState } from "react";
import { colors } from "@/colors";
import { chartCommonOptions } from "@/common/chartCommonOptions";
import { getContrastingTextColor } from "@/common/utils";
import { samplesLinks } from "@/samples";
import { ChartWidgetCard } from "@/ui/ChartWidgetCard";
import { ScrollableContainer } from "@/ui/ScrollableContainer";
import { VerticalLine } from "./primitives/VerticalLine";
import {
  areaSeries,
  maxPrimitivesCountOptions,
  useMaxPrimitivesCountStore,
  usePrimitivesStore,
} from "./primitivesStore";
import { useTooltip } from "./useTooltip";
import type { VerticalLineOptions } from "./primitives/VerticalLine";
import type { PrimitiveData } from "./primitivesStore";
import type { Time } from "lightweight-charts";
import type { RenderPrimitive } from "lightweight-charts-react-components";

type VerticalLinePrimitiveProps = {
  time: Time;
  options?: Partial<VerticalLineOptions>;
};

type TooltipProps = {
  show: boolean;
  x: number | null;
  y: number | null;
  width?: number;
  height?: number;
  time: Time | null;
  onAddPrimitive?: (p: PrimitiveData) => void;
  onClose?: () => void;
};

const Wheel = lazy(() => import("@uiw/react-color-wheel"));

const VerticalLinePrimitive = ({ time, options }: VerticalLinePrimitiveProps) => {
  const renderVertLine: RenderPrimitive = useCallback(
    ({ chart }) => new VerticalLine({ chart, time, options }),
    [time, options]
  );
  return <SeriesPrimitive render={renderVertLine} />;
};

const MemoizedVerticalLinePrimitive = memo(VerticalLinePrimitive);

const Tooltip = ({
  show,
  x,
  y,
  width = 200,
  height = 200,
  onAddPrimitive,
  onClose,
  time,
}: TooltipProps) => {
  const [color, setColor] = useState<string>(colors.pink);
  const colorPickerSize = width / 1.618;

  return (
    <Grow in={show} timeout={{ enter: 300 }}>
      <Box
        role="tooltip"
        aria-live="polite"
        aria-atomic="true"
        aria-label="Color Picker tooltip"
        sx={{
          width: width,
          height: height,
          position: "absolute",
          display: x !== null && y !== null ? "flex" : "none",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: 4,
          padding: 2,
          boxShadow: 2,
          backgroundColor: `${colors.black}99`,
          zIndex: 10,
          top: y,
          left: x,
        }}
      >
        <Stack alignItems="center">
          <Typography color="primary">{`Time: ${time}`}</Typography>
          <Typography color="info">Choose color:</Typography>
        </Stack>
        <Wheel
          width={colorPickerSize}
          height={colorPickerSize}
          color={color}
          onChange={color => {
            setColor(color.hex);
          }}
        />
        <Button
          onClick={() => {
            onAddPrimitive &&
              onAddPrimitive({
                uid: crypto.randomUUID(),
                time: time as Time,
                options: {
                  color,
                  width: 2,
                  labelBgColor: color,
                  labelTextColor: getContrastingTextColor(color),
                },
              });
            onClose && onClose();
          }}
          variant="outlined"
        >
          Add
        </Button>
      </Box>
    </Grow>
  );
};

const Primitives = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const containerRef = useRef<HTMLDivElement>(null);
  const { maxPrimitivesCount, setMaxPrimitivesCount } = useMaxPrimitivesCountStore();
  const { primitives, pushPrimitive } = usePrimitivesStore();
  const tooltipWidth = isMobile ? 175 : 200;
  const tooltipHeight = tooltipWidth * 1.618;
  const {
    close,
    position: { x, y },
    show,
    onChartClick,
    time,
  } = useTooltip({
    width: tooltipWidth,
    height: tooltipHeight,
    containerRef,
  });

  return (
    <ChartWidgetCard
      title="Primitives"
      subTitle="Multiple primitives display on the chart. Click on the chart to add a vertical line."
      sampleConfig={samplesLinks.Primitives}
    >
      <ScrollableContainer sx={{ marginBottom: 2 }}>
        <FormControl sx={{ flexDirection: "row", alignItems: "center" }}>
          <FormLabel htmlFor="max-primitives-count" sx={{ marginRight: 1 }}>
            Max. primitives count:
          </FormLabel>
          <Select
            value={maxPrimitivesCount}
            onChange={({ target }) => setMaxPrimitivesCount(target.value as number)}
            size="small"
            variant="outlined"
            sx={{ minWidth: 120 }}
            inputProps={{ "aria-label": "Max. primitives count" }}
            id="max-primitives-count"
          >
            {maxPrimitivesCountOptions.map(({ value, label }) => (
              <MenuItem key={label} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </ScrollableContainer>
      <ClickAwayListener onClickAway={close}>
        <Box sx={{ flexGrow: 1, position: "relative" }} role="presentation">
          <Chart
            options={chartCommonOptions}
            containerProps={{
              style: { height: "100%" },
            }}
            ref={containerRef}
            onClick={onChartClick}
          >
            <LineSeries
              data={areaSeries}
              options={{
                lineWidth: 3,
                color: colors.violet,
                priceLineVisible: false,
              }}
            >
              {primitives.map(({ uid, options, time }) => (
                <MemoizedVerticalLinePrimitive key={uid} time={time} options={options} />
              ))}
            </LineSeries>
            <TimeScale onVisibleTimeRangeChange={close}>
              <TimeScaleFitContentTrigger deps={[]} />
            </TimeScale>
            <Tooltip
              show={show}
              x={x}
              y={y}
              time={time}
              onClose={close}
              onAddPrimitive={pushPrimitive}
              width={tooltipWidth}
              height={tooltipHeight}
            />
          </Chart>
        </Box>
      </ClickAwayListener>
    </ChartWidgetCard>
  );
};

export { Primitives };
