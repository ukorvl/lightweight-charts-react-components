import { createContext } from "react";
import { type IPaneContext } from "./types";

const PaneContext = createContext<IPaneContext | null>(null);

PaneContext.displayName = "PaneContext";
export { PaneContext };
