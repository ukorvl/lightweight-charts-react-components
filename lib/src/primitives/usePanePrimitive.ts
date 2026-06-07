import { useLayoutEffect, useRef } from "react";
import { BaseInternalError } from "@/_shared/InternalError";
import { useSafeContext } from "@/_shared/useSafeContext";
import { ChartContext } from "@/chart/ChartContext";
import type { IChartContext } from "@/chart/types";
import { usePaneContext } from "@/pane/usePaneContext";
import type { PanePrimitiveApiRef, PanePrimitiveProps } from "./types";
import type { IChartApiBase, Time } from "lightweight-charts";

export const usePanePrimitive = <HorzScaleItem = Time>({
  render,
  plugin,
}: PanePrimitiveProps<HorzScaleItem>) => {
  const { isReady: isChartReady, chartApiRef: chart } = useSafeContext(
    ChartContext
  ) as IChartContext<HorzScaleItem, IChartApiBase<HorzScaleItem>>;
  const { isInsidePane, isPaneReady, paneApiRef: pane } = usePaneContext<HorzScaleItem>();

  const panePrimitiveApiRef = useRef<PanePrimitiveApiRef<HorzScaleItem>>({
    _primitive: null,
    api() {
      return this._primitive;
    },
    init() {
      if (!this._primitive) {
        const chartApi = chart?.api();
        const paneApi = pane?.api();

        if (!chartApi || !paneApi) {
          return null;
        }

        const primitive = plugin
          ? plugin
          : render({
              chart: chartApi,
              pane: paneApi,
            });

        paneApi.attachPrimitive(primitive);
        this._primitive = primitive;
      }

      return this._primitive;
    },
    clear() {
      if (this._primitive !== null) {
        pane?.api()?.detachPrimitive(this._primitive);
        this._primitive = null;
      }
    },
  });

  useLayoutEffect(() => {
    if (!isChartReady) return;

    if (!isInsidePane) {
      throw new BaseInternalError(
        "PanePrimitive must be used inside a pane. Please ensure that the component is wrapped in a pane component.",
        {
          isOperational: true,
          docsPath: "pane-primitives",
        }
      );
    }

    if (!isPaneReady) {
      return;
    }

    panePrimitiveApiRef.current.init();
  }, [isChartReady, isInsidePane, isPaneReady]);

  useLayoutEffect(() => {
    return () => {
      panePrimitiveApiRef.current.clear();
    };
  }, []);

  return panePrimitiveApiRef;
};
