import type { IPaneApi, Time } from "lightweight-charts";
import type { ReactNode } from "react";

/**
 * Pane component props.
 */
export type PaneProps = {
  /**
   * Children of the pane component.
   */
  children?: ReactNode;
  /**
   * Stretch factor for the pane, which determines how much space the pane should take relative to other panes.
   */
  stretchFactor?: number;
};

/**
 * Pane API reference type that can be used to access the pane plugin API.
 */
export type PaneApiRef = {
  /**
   * Reference to the pane API.
   */
  _pane: IPaneApi<Time> | null;
  /**
   * Function to get the pane API.
   */
  api: () => IPaneApi<Time> | null;
  /**
   * Function to initialize the pane API.
   */
  init: () => IPaneApi<Time> | null;
  /**
   * Function to clear the pane API.
   */
  clear: () => void;
};

/**
 * Pane context that provides access to the pane API and readiness state.
 */
export interface IPaneContext {
  /**
   * Reference to the pane API.
   */
  paneApiRef?: PaneApiRef;
  /**
   * Readiness state of the pane component.
   */
  isReady: boolean;
}
