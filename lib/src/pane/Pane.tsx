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

/**
 * Pane component that can be used to create a pane in a chart.
 *
 * @param props - The properties for the pane.
 * @param ref - The ref to access the pane API.
 * @returns A React component that renders the pane.
 * @see {@link https://ukorvl.github.io/lightweight-charts-react-components/docs/panes | Panes documentation}
 * @see {@link https://tradingview.github.io/lightweight-charts/docs/panes | TradingView documentation for panes}
 * @example
 * ```tsx
 * <Pane stretchFactor={2}>
 * ...
 * </Pane>
 * ```
 */
export const Pane: ForwardRefExoticComponent<PaneProps & RefAttributes<PaneApiRef>> =
  forwardRef(PaneRenderFunction);
Pane.displayName = "Pane";
