import { createContext } from "react";
import { type IChartContext } from "./types";
import type { IChartApiBase } from "lightweight-charts";

const ChartContext = createContext<IChartContext<unknown, IChartApiBase<unknown>> | null>(
  null
);

ChartContext.displayName = "ChartContext";
export { ChartContext };
