import { createContext } from "react";
import { type IChartContext } from "./types";

const ChartContext = createContext<IChartContext>({
  chartApiRef: null,
  initialized: false,
});

ChartContext.displayName = "ChartContext";
export { ChartContext };
