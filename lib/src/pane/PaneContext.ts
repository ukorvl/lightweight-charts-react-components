import { createContext } from "react";
import { type IPaneContext } from "./types";

const PaneContext = createContext<IPaneContext | null>({
  initialized: false,
});

PaneContext.displayName = "PaneContext";
export { PaneContext };
