import { useContext } from "react";
import { PaneContext } from "./PaneContext";

const usePaneContext = () => {
  const paneContext = useContext(PaneContext);
  const isInsidePane = !!paneContext;
  const isPaneReady = paneContext?.isReady;
  const paneIndex = paneContext?.paneIndex;

  return { isInsidePane, isPaneReady, paneIndex };
};

export { usePaneContext };
