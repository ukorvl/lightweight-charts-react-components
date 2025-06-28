import { useContext } from "react";
import { PaneContext } from "./PaneContext";

const usePaneContext = () => {
  const paneContext = useContext(PaneContext);

  const isInsidePane = !!paneContext;
  const isPaneReady = !!paneContext?.isReady;
  const paneApiRef = paneContext?.paneApiRef;

  return { isInsidePane, isPaneReady, paneApiRef };
};

export { usePaneContext };
