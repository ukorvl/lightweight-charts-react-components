import type { IPaneApi, Time } from "lightweight-charts";
import type { ReactNode } from "react";

export type PaneProps = {
  children?: ReactNode;
  stretchFactor?: number;
};

export type PaneApiRef = {
  _pane: IPaneApi<Time> | null;
  api: () => IPaneApi<Time> | null;
  init: () => IPaneApi<Time> | null;
  clear: () => void;
};

export interface IPaneContext {
  paneApiRef?: PaneApiRef;
  isReady: boolean;
}
