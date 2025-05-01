import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSafeContext } from "@/_shared/useSafeContext";
import { ChartContext } from "@/chart/ChartContext";
import type { PaneApiRef, PaneProps } from "./types";

export const usePane = ({ paneIndex, height }: Omit<PaneProps, "children">) => {
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

      const pane = chartApi.addPane(paneIndex);
      this._pane = pane;

      if (height) {
        pane.setHeight(height);
      }

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
    if (!chartIsReady) return;

    paneApiRef.current.init();
  }, [chartIsReady]);

  useLayoutEffect(() => {
    return () => {
      paneApiRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!chart || !isReady) return;

    const pane = paneApiRef.current.api();
    if (height) {
      pane?.setHeight(height);
    }
  }, [height, isReady]);

  return { paneApiRef, isReady };
};
