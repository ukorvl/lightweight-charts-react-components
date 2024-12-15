import type {
  SeriesOptionsCommon,
  HistogramSeriesPartialOptions,
  DeepPartial,
  CandlestickSeriesPartialOptions,
  LineSeriesPartialOptions,
  SeriesType,
  AreaSeriesPartialOptions,
} from "lightweight-charts";
import { COLORS } from "../../../shared";

const seriesBaseDefaultOptions: DeepPartial<SeriesOptionsCommon> = {
  priceLineColor: COLORS.blue300,
};

const seriesCandlestickDefaultOptions: CandlestickSeriesPartialOptions = {
  ...seriesBaseDefaultOptions,
  upColor: COLORS.green300,
  downColor: COLORS.red300,
  borderVisible: false,
  wickVisible: true,
  borderColor: COLORS.green300,
  wickColor: COLORS.green300,
  borderUpColor: COLORS.green300,
  borderDownColor: COLORS.red300,
  wickUpColor: COLORS.green300,
  wickDownColor: COLORS.red300,
};

const seriesLineDefaultOptions: LineSeriesPartialOptions = {
  ...seriesBaseDefaultOptions,
  color: COLORS.blue300,
  lineWidth: 2,
  crosshairMarkerVisible: false,
  crosshairMarkerRadius: 0,
  crosshairMarkerBorderColor: COLORS.blue300,
  crosshairMarkerBackgroundColor: COLORS.blue300,
};

const seriesHistogramDefaultOptions: HistogramSeriesPartialOptions = {
  ...seriesBaseDefaultOptions,
  color: COLORS.blue300,
  base: 0,
};

const seriesAreaDefaultOptions: AreaSeriesPartialOptions = {
  ...seriesBaseDefaultOptions,
  topColor: COLORS.blue300,
  bottomColor: "transparent",
  lineColor: COLORS.blue300,
  lineStyle: 0,
  lineWidth: 2,
};

export const getSeriesDefaultOptions = (type: SeriesType) => {
  switch (type) {
    case "Candlestick":
      return seriesCandlestickDefaultOptions;
    case "Line":
      return seriesLineDefaultOptions;
    case "Histogram":
      return seriesHistogramDefaultOptions;
    case "Area":
      return seriesAreaDefaultOptions;
    default:
      return {};
  }
};
