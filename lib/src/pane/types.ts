import type { IPaneApi, Time } from "lightweight-charts";
import type { ReactNode } from "react";

/**
 * Pane component props.
 */
export type PaneProps = {
  children?: ReactNode;
  stretchFactor?: number;
};

/**
 * Pane API reference type that can be used to access the pane plugin API.
 */
export type PaneApiRef = {
  _pane: IPaneApi<Time> | null;
  api: () => IPaneApi<Time> | null;
  init: () => IPaneApi<Time> | null;
  clear: () => void;
};

/**
 * Pane context that provides access to the pane API and readiness state.
 */
export interface IPaneContext {
  paneApiRef?: PaneApiRef;
  isReady: boolean;
}
