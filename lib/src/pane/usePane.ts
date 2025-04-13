import { useLayoutEffect, useRef, useState } from "react";
import { ChartContext } from "@/chart/ChartContext";
import { useSafeContext } from "@/shared/useSafeContext";
import type { PaneApiRef, PaneProps } from "./types";

export const usePane = ({ id, height }: Omit<PaneProps, "children">) => {
  const { initialized: chartInitialized, chartApiRef: chart } =
    useSafeContext(ChartContext);
  const [initialized, setInitialized] = useState(false);

  const paneApiRef = useRef<PaneApiRef>({
    _pane: null,
    api() {
      return this._pane;
    },
    init() {
      setInitialized(true);
      const panes = chart?.api()?.panes();

      if (!panes) return null;

      this._pane = panes[id];

      if (height) {
        this._pane.setHeight(height);
      }

      return this._pane;
    },
    clear() {
      if (this._pane !== null) {
        chart?.api()?.removePane(id);
        setInitialized(false);
        this._pane = null;
      }
    },
  });

  useLayoutEffect(() => {
    if (!chartInitialized) return;

    paneApiRef.current.init();
  }, [chartInitialized]);

  useLayoutEffect(() => {
    return () => {
      paneApiRef.current.clear();
    };
  }, []);

  useLayoutEffect(() => {
    if (!chart) return;

    if (id) {
      paneApiRef.current.api()?.moveTo(id);
    }
  }, [id]);

  useLayoutEffect(() => {
    if (!chart) return;

    if (height) {
      paneApiRef.current.api()?.setHeight(height);
    }
  }, [height]);

  return { paneApiRef, initialized };
};
