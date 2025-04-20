import type { IPaneApi, Time } from "lightweight-charts";
import type { ReactNode } from "react";

export type PaneProps = {
  children?: ReactNode;
};

export type PaneApiRef = {
  _pane: IPaneApi<Time> | null;
  api: () => IPaneApi<Time> | null;
  init: (i: number) => IPaneApi<Time> | null;
  clear: () => void;
};

export interface IPaneContext {
  paneApiRef?: PaneApiRef;
  paneIndex: number | null;
  setPaneIndex?: (paneIndex: number) => void;
  isReady: boolean;
}

export type PanesMap = Map<number, number>;
