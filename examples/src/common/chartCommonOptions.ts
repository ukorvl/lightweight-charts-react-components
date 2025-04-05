import { colors } from "@/colors";
import type { ChartOptions, DeepPartial } from "lightweight-charts";

export const chartCommonOptions = {
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
} satisfies DeepPartial<ChartOptions>;
