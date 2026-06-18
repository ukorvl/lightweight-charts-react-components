import { useLayoutEffect, useRef } from "react";
import { BaseInternalError } from "@/_shared/InternalError";
import { useSafeContext } from "@/_shared/useSafeContext";
import { ChartContext } from "@/chart/ChartContext";
import type { IChartContext } from "@/chart/types";
import { usePaneContext } from "@/pane/usePaneContext";
import { useReactivePrimitive } from "./useReactivePrimitive";
import type { PanePrimitiveApiRef, PanePrimitiveProps } from "./types";
import type { IChartApiBase, Time } from "lightweight-charts";
import type { RefObject } from "react";

export const usePanePrimitive = <HorzScaleItem = Time>(
  props: PanePrimitiveProps<HorzScaleItem>
): RefObject<PanePrimitiveApiRef<HorzScaleItem>> => {
  const { isReady: isChartReady, chartApiRef: chart } = useSafeContext(
    ChartContext
  ) as IChartContext<HorzScaleItem, IChartApiBase<HorzScaleItem>>;
  const { isInsidePane, isPaneReady, paneApiRef: pane } = usePaneContext<HorzScaleItem>();
  const chartApiRef = useRef(chart);
  const paneApiRef = useRef(pane);

  chartApiRef.current = chart;
  paneApiRef.current = pane;
  const panePrimitiveApiRef = useReactivePrimitive({
    isReady: isChartReady && isInsidePane && isPaneReady,
    props,
    primitiveIdentity: props.plugin ?? props.render,
    mountPrimitive(currentProps) {
      const chartApi = chartApiRef.current?.api();
      const paneApi = paneApiRef.current?.api();

      if (!chartApi || !paneApi) {
        return null;
      }

      const primitive =
        currentProps.plugin !== undefined
          ? currentProps.plugin
          : currentProps.render({
              chart: chartApi,
              pane: paneApi,
            });

      paneApi.attachPrimitive(primitive);

      return {
        primitive,
        detach: () => paneApi.detachPrimitive(primitive),
      };
    },
  });

  useLayoutEffect(() => {
    if (!isChartReady) {
      return;
    }

    if (!isInsidePane) {
      throw new BaseInternalError(
        "PanePrimitive must be used inside a pane. Please ensure that the component is wrapped in a pane component.",
        {
          isOperational: true,
          docsPath: "pane-primitives",
        }
      );
    }
  }, [isChartReady, isInsidePane]);

  return panePrimitiveApiRef;
};
