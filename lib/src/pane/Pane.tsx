import { forwardRef, useImperativeHandle } from "react";
import React from "react";
import { PaneContext } from "./PaneContext";
import { usePane } from "./usePane";
import type { PaneProps, PaneApiRef } from "./types";
import type { ForwardedRef, ForwardRefExoticComponent, RefAttributes } from "react";

const PaneRenderFunction = (
  { children, paneIndex, height }: PaneProps,
  ref: ForwardedRef<PaneApiRef>
) => {
  const {
    paneApiRef: { current: paneApiRef },
    isReady,
  } = usePane({ paneIndex, height });
  useImperativeHandle(ref, () => paneApiRef, [paneApiRef]);

  return (
    <PaneContext.Provider
      value={{
        paneApiRef,
        isReady,
        paneIndex,
        height,
      }}
    >
      {children}
    </PaneContext.Provider>
  );
};

const Pane: ForwardRefExoticComponent<PaneProps & RefAttributes<PaneApiRef>> =
  forwardRef(PaneRenderFunction);
Pane.displayName = "Pane";
export { Pane };
