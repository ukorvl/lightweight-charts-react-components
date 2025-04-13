import type { IPaneApi, Time } from "lightweight-charts";
import type { ReactNode } from "react";

export type PaneProps = {
  id: number;
  children?: ReactNode;
  height?: number;
};

export type PaneApiRef = {
  _pane: IPaneApi<Time> | null;
  api: () => IPaneApi<Time> | null;
  init: () => IPaneApi<Time> | null;
  clear: () => void;
};

export interface IPaneContext {
  paneApiRef?: PaneApiRef;
  paneId?: number;
  initialized: boolean;
}
