import { forwardRef, useImperativeHandle, useState } from "react";
import { PaneContext } from "./PaneContext";
import { usePane } from "./usePane";
import type { PaneProps, PaneApiRef } from "./types";
import type { ForwardedRef } from "react";

const PaneRenderFunction = ({ children }: PaneProps, ref: ForwardedRef<PaneApiRef>) => {
  const [paneIndex, setPaneIndex] = useState<number | null>(null);
  const {
    paneApiRef: { current: paneApiRef },
    isReady,
  } = usePane({ paneIndex });
  useImperativeHandle(ref, () => paneApiRef, [paneApiRef]);

  return (
    <PaneContext.Provider
      value={{
        paneApiRef,
        isReady,
        paneIndex,
        setPaneIndex,
      }}
    >
      {children}
    </PaneContext.Provider>
  );
};

const Pane = forwardRef(PaneRenderFunction);
Pane.displayName = "Pane";
export { Pane };
