import { createContext } from "react";
import { SeriesApiRef, SeriesType } from "./types";

export const SeriesContext = createContext({} as SeriesApiRef<SeriesType>);
SeriesContext.displayName = "SeriesContext";
