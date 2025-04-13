import { forwardRef, useImperativeHandle } from "react";
import { PaneContext } from "./PaneContext";
import { usePane } from "./usePane";
import type { PaneProps, PaneApiRef } from "./types";
import type { ForwardedRef } from "react";

const PaneRenderFunction = (
  { children, id, height }: PaneProps,
  ref: ForwardedRef<PaneApiRef>
) => {
  const {
    paneApiRef: { current: paneApiRef },
    initialized,
  } = usePane({ id, height });
  useImperativeHandle(ref, () => paneApiRef, [paneApiRef]);

  return (
    <PaneContext.Provider
      value={{
        paneApiRef,
        initialized,
        paneId: id,
      }}
    >
      {children}
    </PaneContext.Provider>
  );
};

const Pane = forwardRef(PaneRenderFunction);
Pane.displayName = "Pane";
export { Pane };
