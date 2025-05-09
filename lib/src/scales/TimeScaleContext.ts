import { createContext } from "react";
import { type ITimeScaleContext } from "./types";

const TimeScaleContext = createContext<ITimeScaleContext | null>(null);
TimeScaleContext.displayName = "TimeScaleContext";
export { TimeScaleContext };
