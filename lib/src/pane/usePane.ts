import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { useSafeContext } from "@/_shared/useSafeContext";
import { ChartContext } from "@/chart/ChartContext";
import type { IChartContext } from "@/chart/types";
import type { PaneApiRef, PaneProps } from "./types";
import type { IChartApiBase, Time } from "lightweight-charts";

export const usePane = <HorzScaleItem = Time>({
  stretchFactor,
}: Omit<PaneProps, "children"> = {}) => {
  const { chartApiRef: chart, isReady: chartIsReady } = useSafeContext(
    ChartContext
  ) as IChartContext<HorzScaleItem, IChartApiBase<HorzScaleItem>>;
  const [isReady, setIsReady] = useState(false);

  const paneApiRef = useRef<PaneApiRef<HorzScaleItem>>({
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

      if (stretchFactor !== undefined) {
        this._pane.setStretchFactor(stretchFactor);
      }

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

  useEffect(() => {
    return () => {
      paneApiRef.current.clear();
    };
  }, []);

  useLayoutEffect(() => {
    if (stretchFactor === undefined) return;

    const pane = paneApiRef.current.api();
    if (pane) {
      pane.setStretchFactor(stretchFactor);
    }
  }, [stretchFactor]);

  return { paneApiRef, isReady };
};
