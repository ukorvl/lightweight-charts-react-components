import { createContext } from "react";
import { ChartApiRef } from "./types";

export const ChartContext = createContext({} as ChartApiRef);
ChartContext.displayName = "ChartContext";
