import { createContext } from "react";
import { type IChartContext } from "./types";

const ChartContext = createContext<IChartContext | null>(null);

ChartContext.displayName = "ChartContext";
export { ChartContext };
