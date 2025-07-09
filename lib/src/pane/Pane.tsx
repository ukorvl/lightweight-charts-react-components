import { forwardRef, useImperativeHandle } from "react";
import React from "react";
import { PaneContext } from "./PaneContext";
import { usePane } from "./usePane";
import type { PaneProps, PaneApiRef } from "./types";
import type { ForwardedRef, ForwardRefExoticComponent, RefAttributes } from "react";

const PaneRenderFunction = (
  { children, stretchFactor }: PaneProps,
  ref: ForwardedRef<PaneApiRef>
) => {
  const {
    paneApiRef: { current: paneApiRef },
    isReady,
  } = usePane({ stretchFactor });
  useImperativeHandle(ref, () => paneApiRef, [paneApiRef]);

  return (
    <PaneContext.Provider
      value={{
        paneApiRef,
        isReady,
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
