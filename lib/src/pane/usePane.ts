import { useLayoutEffect, useRef, useState } from "react";
import { useSafeContext } from "@/_shared/useSafeContext";
import { ChartContext } from "@/chart/ChartContext";
import type { PaneApiRef, PaneProps } from "./types";

export const usePane = ({ height, stretchFactor }: Omit<PaneProps, "children"> = {}) => {
  const { chartApiRef: chart, isReady: chartIsReady } = useSafeContext(ChartContext);
  const [isReady, setIsReady] = useState(false);

  const paneApiRef = useRef<PaneApiRef>({
    _pane: null,
    api() {
      return this._pane;
    },
    init() {
      const chartApi = chart?.api();
      if (!chartApi) return null;

      const pane = chartApi.addPane(true);
      this._pane = pane;

      setIsReady(true);

      if (height !== undefined) {
        this._pane.setHeight(height);
      }

      if (stretchFactor !== undefined) {
        this._pane.setStretchFactor(stretchFactor);
      }

      return this._pane;
    },
    clear() {
      if (this._pane !== null) {
        // don't remove pane completely but hide
        chart?.api()?.removePane(this._pane.paneIndex());
        setIsReady(false);

        this._pane = null;
      }
    },
  });

  useLayoutEffect(() => {
    if (!chartIsReady) return;

    paneApiRef.current.init();
  }, [chartIsReady]);

  useLayoutEffect(() => {
    return () => {
      paneApiRef.current.clear();
    };
  }, []);

  useLayoutEffect(() => {
    if (height === undefined) return;

    const pane = paneApiRef.current.api();
    if (pane) {
      pane.setHeight(height);
    }
  }, [height]);

  useLayoutEffect(() => {
    if (stretchFactor === undefined) return;

    const pane = paneApiRef.current.api();
    if (pane) {
      pane.setStretchFactor(stretchFactor);
    }
  }, [stretchFactor]);

  return { paneApiRef, isReady };
};
