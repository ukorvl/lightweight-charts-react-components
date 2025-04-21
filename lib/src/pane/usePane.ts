import { useLayoutEffect, useRef, useState } from "react";
import { useSafeContext } from "@/_shared/useSafeContext";
import { ChartContext } from "@/chart/ChartContext";
import type { PaneApiRef } from "./types";

type Options = {
  paneIndex: number | null;
};

export const usePane = ({ paneIndex }: Options) => {
  const { chartApiRef: chart } = useSafeContext(ChartContext);
  const [isReady, setIsReady] = useState(false);

  const paneApiRef = useRef<PaneApiRef>({
    _pane: null,
    api() {
      return this._pane;
    },
    init(paneIndex: number) {
      const panes = chart?.api()?.panes();

      if (!panes) return null;
      const pane = panes[paneIndex!];

      if (!pane) {
        return null;
      }

      this._pane = pane;
      setIsReady(true);

      return this._pane;
    },
    clear() {
      if (this._pane !== null) {
        chart?.api()?.removePane(this._pane.paneIndex());
        setIsReady(false);

        this._pane = null;
      }
    },
  });

  useLayoutEffect(() => {
    if (paneIndex === null || paneIndex === undefined) return;

    paneApiRef.current.init(paneIndex);
  }, [paneIndex]);

  useLayoutEffect(() => {
    return () => {
      paneApiRef.current.clear();
    };
  }, []);

  return { paneApiRef, isReady };
};
