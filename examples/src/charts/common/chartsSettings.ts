import { ChartOptions, DeepPartial } from "lightweight-charts";

export const chartCommonSettings = {
  layout: {
    attributionLogo: false,
    fontFamily: "Roboto",
  },
} satisfies DeepPartial<ChartOptions>;
