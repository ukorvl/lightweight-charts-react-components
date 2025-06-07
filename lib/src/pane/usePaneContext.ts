import { useContext } from "react";
import { PaneContext } from "./PaneContext";

const usePaneContext = () => {
  const paneContext = useContext(PaneContext);

  const isInsidePane = !!paneContext;
  const isPaneReady = !!paneContext?.isReady;
  const { paneIndex, height, paneApiRef } = paneContext ?? {};

  return { isInsidePane, isPaneReady, paneIndex, height, paneApiRef };
};

export { usePaneContext };
