import { forwardRef, useImperativeHandle } from "react";
import React from "react";
import { PaneContext } from "./PaneContext";
import { usePane } from "./usePane";
import type { PaneProps, PaneApiRef } from "./types";
import type { ForwardedRef } from "react";

const PaneRenderFunction = (
  { children, paneIndex }: PaneProps,
  ref: ForwardedRef<PaneApiRef>
) => {
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
      }}
    >
      {children}
    </PaneContext.Provider>
  );
};

const Pane = forwardRef(PaneRenderFunction);
Pane.displayName = "Pane";
export { Pane };
