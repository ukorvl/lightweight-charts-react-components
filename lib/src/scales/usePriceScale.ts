import { useContext, useLayoutEffect, useRef } from "react";
import { BaseInternalError } from "@/_shared/InternalError";
import { useSafeContext } from "@/_shared/useSafeContext";
import { ChartContext } from "@/chart/ChartContext";
import { usePaneContext } from "@/pane/usePaneContext";
import { SeriesContext } from "@/series/SeriesContext";
import type { PriceScaleProps, PriceScaleApiRef } from "./types";

export const usePriceScale = ({ options = {}, id }: PriceScaleProps) => {
  const { isReady: chartIsReady, chartApiRef: chart } = useSafeContext(ChartContext);
  const { isInsidePane, isPaneReady, paneApiRef } = usePaneContext();
  // Custom (overlay) price scales exist only after a series that uses them is added,
  // so a PriceScale nested inside a series waits for that series.
  const { seriesApiRef: series, isReady: seriesIsReady } = useContext(SeriesContext);
  const isParentSeriesReady = series === null || seriesIsReady;

  const priceScaleApiRef = useRef<PriceScaleApiRef>({
    _priceScale: null,
    api() {
      return this._priceScale;
    },
    init() {
      if (!this._priceScale) {
        const chartApi = chart?.api();

        if (!chartApi) {
          return null;
        }

        this._priceScale = chartApi.priceScale(id, paneApiRef?.api()?.paneIndex());

        this._priceScale.applyOptions(options);
      }

      return this._priceScale;
    },
    setId(idToSet) {
      if (this._priceScale === null || chart === null) {
        return;
      }

      this._priceScale = chart.api()!.priceScale(idToSet, paneApiRef?.api()?.paneIndex());
      this._priceScale.applyOptions(options);
    },
    clear() {
      this._priceScale = null;
    },
  });

  useLayoutEffect(() => {
    if (!chartIsReady) return;

    if (!isInsidePane) {
      // TODO: Replace the empty docsPath with the published price scale docs route.
      throw new BaseInternalError(
        "PriceScale must be used inside a pane. Please ensure that the component is wrapped in a pane component.",
        {
          isOperational: true,
          docsPath: "",
        }
      );
    }

    if (!isPaneReady || !isParentSeriesReady) {
      return;
    }

    priceScaleApiRef.current.init();
  }, [chartIsReady, isInsidePane, isPaneReady, isParentSeriesReady]);

  useLayoutEffect(() => {
    return () => {
      priceScaleApiRef.current.clear();
    };
  }, []);

  useLayoutEffect(() => {
    if (!chart) return;

    priceScaleApiRef.current?.setId(id);
  }, [id]);

  useLayoutEffect(() => {
    if (!chart) return;

    if (options) {
      priceScaleApiRef.current?.api()?.applyOptions(options);
    }
  }, [options]);

  return priceScaleApiRef;
};
