import { ChartOptions, DeepPartial } from "lightweight-charts";

export const chartCommonSettings = {
  layout: {
    attributionLogo: false,
  },
} satisfies DeepPartial<ChartOptions>;
