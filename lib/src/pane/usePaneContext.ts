import { useContext } from "react";
import { PaneContext } from "./PaneContext";
import type { IPaneContext } from "./types";
import type { Time } from "lightweight-charts";

const usePaneContext = <HorzScaleItem = Time>() => {
  const paneContext = useContext(PaneContext) as IPaneContext<HorzScaleItem> | null;

  const isInsidePane = !!paneContext;
  const isPaneReady = !!paneContext?.isReady;
  const paneApiRef = paneContext?.paneApiRef;

  return { isInsidePane, isPaneReady, paneApiRef };
};

export { usePaneContext };
