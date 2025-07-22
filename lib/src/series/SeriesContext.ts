import { createContext } from "react";
import { type ISeriesContext } from "./types";

const SeriesContext = createContext<ISeriesContext>({
  seriesApiRef: null,
  isReady: false,
});
SeriesContext.displayName = "SeriesContext";
export { SeriesContext };
