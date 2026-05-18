import { colors } from "@/common/colors";
import { fontFamily } from "./fontFamily";
import { deepMergePlainObjects } from "./utils";
import type { ChartOptions, DeepPartial } from "lightweight-charts";

const chartCommonOptions = {
  autoSize: true,
  layout: {
    attributionLogo: false,
    fontFamily,
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
} satisfies DeepPartial<ChartOptions>;

const withChartCommonOptions = (
  options: DeepPartial<ChartOptions>
): DeepPartial<ChartOptions> => deepMergePlainObjects(chartCommonOptions, options);

export { chartCommonOptions, withChartCommonOptions };
