import { createContext } from "react";
import { type ISeriesContext } from "./types";

export const SeriesContext = createContext<ISeriesContext>({
  seriesApiRef: null,
  initialized: false,
});
SeriesContext.displayName = "SeriesContext";
