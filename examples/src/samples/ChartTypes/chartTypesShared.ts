import {
  type AreaData,
  defaultHorzScaleBehavior,
  type AreaSeriesOptions,
  type ChartOptions,
  type DeepPartial,
  type IHorzScaleBehavior,
  type LineData,
  type LineSeriesOptions,
  type LocalizationOptions,
  type PriceChartOptions,
  type TickMark,
  type Time,
  type YieldCurveChartOptions,
} from "lightweight-charts";
import { colors } from "../../common/colors";

const baseChartOptions = {
  autoSize: true,
  layout: {
    attributionLogo: false,
    fontFamily: "Roboto",
    background: {
      color: "transparent",
    },
    textColor: colors.blue,
  },
  grid: {
    vertLines: {
      visible: false,
    },
    horzLines: {
      visible: false,
    },
  },
  crosshair: {
    vertLine: {
      style: 3,
      color: colors.gray,
    },
    horzLine: {
      style: 3,
      color: colors.gray,
    },
  },
} as const;

const formatMonths = (months: number) => {
  if (months < 12) {
    return `${months}M`;
  }

  if (months % 12 === 0) {
    return `${months / 12}Y`;
  }

  return `${(months / 12).toFixed(1)}Y`;
};

const toQuarterLabel = (time: unknown) => {
  if (typeof time === "string") {
    const [year, month] = time.split("-").map(Number);
    if (!Number.isFinite(year) || !Number.isFinite(month)) {
      return null;
    }

    return `Q${Math.floor((month - 1) / 3) + 1} ${year}`;
  }

  if (
    typeof time === "object" &&
    time !== null &&
    "year" in time &&
    "month" in time &&
    typeof time.year === "number" &&
    typeof time.month === "number"
  ) {
    return `Q${Math.floor((time.month - 1) / 3) + 1} ${time.year}`;
  }

  return null;
};

const BaseQuarterScaleBehavior = defaultHorzScaleBehavior();

class QuarterScaleBehavior extends BaseQuarterScaleBehavior {
  public override formatTickmark(
    item: TickMark,
    localizationOptions: LocalizationOptions<Time>
  ): string {
    return (
      toQuarterLabel(item.originalTime) ?? super.formatTickmark(item, localizationOptions)
    );
  }
}

const quarterScaleBehavior: IHorzScaleBehavior<Time> = new QuarterScaleBehavior();

const optionsChartData = [
  { time: 80, value: 0.48 },
  { time: 85, value: 0.92 },
  { time: 90, value: 1.65 },
  { time: 95, value: 2.55 },
  { time: 100, value: 3.08 },
  { time: 105, value: 2.41 },
  { time: 110, value: 1.58 },
  { time: 115, value: 0.86 },
  { time: 120, value: 0.43 },
] satisfies LineData<number>[];

const yieldCurveLineData = [
  { time: 1, value: 4.9 },
  { time: 3, value: 4.7 },
  { time: 6, value: 4.45 },
  { time: 12, value: 4.12 },
  { time: 24, value: 3.86 },
  { time: 60, value: 3.58 },
  { time: 120, value: 3.35 },
  { time: 240, value: 3.22 },
  { time: 360, value: 3.15 },
] satisfies LineData<number>[];

const yieldCurveAreaData = yieldCurveLineData.map(point => ({
  ...point,
  value: Math.max(point.value - 0.18, 0),
})) satisfies AreaData<number>[];

const customChartData = [
  { time: "2025-01-01", value: 128 },
  { time: "2025-03-01", value: 142 },
  { time: "2025-06-01", value: 136 },
  { time: "2025-09-01", value: 151 },
  { time: "2025-12-01", value: 164 },
  { time: "2026-03-01", value: 159 },
  { time: "2026-06-01", value: 171 },
  { time: "2026-09-01", value: 183 },
  { time: "2026-12-01", value: 190 },
] satisfies LineData<Time>[];

const optionsChartOptions = {
  ...baseChartOptions,
  localization: {
    priceFormatter: (value: number) => `$${value.toFixed(0)}`,
  },
  rightPriceScale: {
    borderVisible: false,
  },
  timeScale: {
    borderVisible: false,
  },
} satisfies DeepPartial<PriceChartOptions>;

const yieldCurveChartOptions = {
  ...baseChartOptions,
  localization: {
    priceFormatter: (value: number) => `${value.toFixed(2)}%`,
  },
  rightPriceScale: {
    borderVisible: false,
  },
  timeScale: {
    borderVisible: false,
  },
  yieldCurve: {
    minimumTimeRange: 360,
    startTimeRange: 0,
    formatTime: formatMonths,
  },
} satisfies DeepPartial<YieldCurveChartOptions>;

const customChartOptions = {
  ...baseChartOptions,
  rightPriceScale: {
    borderVisible: false,
  },
  timeScale: {
    borderVisible: false,
  },
} satisfies DeepPartial<ChartOptions>;

const optionsSeriesOptions = {
  color: colors.orange,
  lineWidth: 3,
  priceLineVisible: false,
  lastValueVisible: false,
  crosshairMarkerBorderColor: colors.orange,
  crosshairMarkerBackgroundColor: colors.blue200,
} satisfies DeepPartial<LineSeriesOptions>;

const yieldCurveLineOptions = {
  color: colors.orange100,
  lineWidth: 3,
  priceLineVisible: false,
  lastValueVisible: false,
} satisfies DeepPartial<LineSeriesOptions>;

const yieldCurveAreaOptions = {
  lineColor: colors.cyan,
  topColor: `${colors.cyan}35`,
  bottomColor: `${colors.cyan}08`,
  lineWidth: 2,
  priceLineVisible: false,
  lastValueVisible: false,
} satisfies DeepPartial<AreaSeriesOptions>;

const customSeriesOptions = {
  color: colors.green,
  lineWidth: 3,
  lineStyle: 2,
  priceLineVisible: false,
  lastValueVisible: false,
  crosshairMarkerBorderColor: colors.green,
  crosshairMarkerBackgroundColor: colors.blue200,
} satisfies DeepPartial<LineSeriesOptions>;

const chartTypeTabs = ["Options", "Yield curve", "Custom"] as const;

type ChartTypeTab = (typeof chartTypeTabs)[number];

export {
  chartTypeTabs,
  customChartData,
  customChartOptions,
  customSeriesOptions,
  optionsChartData,
  optionsChartOptions,
  optionsSeriesOptions,
  quarterScaleBehavior,
  yieldCurveAreaData,
  yieldCurveAreaOptions,
  yieldCurveChartOptions,
  yieldCurveLineData,
  yieldCurveLineOptions,
  type ChartTypeTab,
};
