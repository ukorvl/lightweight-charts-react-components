import { useContext, useEffect, useLayoutEffect, useRef } from "react";
import { BaseInternalError } from "@/_shared/InternalError";
import { useLatestRef } from "@/_shared/useLatestRef";
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
  const optionsRef = useLatestRef(options);

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

        this._priceScale.applyOptions(optionsRef.current);
      }

      return this._priceScale;
    },
    setId(idToSet) {
      if (this._priceScale === null || chart === null) {
        return;
      }

      this._priceScale = chart.api()!.priceScale(idToSet, paneApiRef?.api()?.paneIndex());
      this._priceScale.applyOptions(optionsRef.current);
    },
    clear() {
      this._priceScale = null;
    },
  });

  // Passive, so a series that switches to this custom priceScaleId while mounting it applies the switch first
  useEffect(() => {
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

  // Passive, so it runs after a parent series applies a new custom priceScaleId. Rebinding on
  // every update also picks up the current pane index, which shifts when a pane above is removed.
  // shortcut: api() keeps the old pane index until the next id or options update, re-resolve it in api() if imperative callers need it.
  useEffect(() => {
    if (!chart) return;

    priceScaleApiRef.current.setId(id);
  }, [id, options]);

  return priceScaleApiRef;
};
