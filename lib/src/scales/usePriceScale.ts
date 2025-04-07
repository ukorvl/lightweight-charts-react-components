import { useLayoutEffect, useRef } from "react";
import { ChartContext } from "@/chart/ChartContext";
import { useSafeContext } from "@/shared/useSafeContext";
import type { PriceScaleProps, PriceScaleApiRef } from "./types";

export const usePriceScale = ({ options = {}, id }: PriceScaleProps) => {
  const { initialized: chartInitialized, chartApiRef: chart } =
    useSafeContext(ChartContext);

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

        this._priceScale = chartApi.priceScale(id);

        this._priceScale.applyOptions(options);
      }

      return this._priceScale;
    },
    setId(id) {
      if (this._priceScale === null || chart === null) {
        return;
      }

      this._priceScale = chart.api()!.priceScale(id);
      this._priceScale.applyOptions(options);
    },
    clear() {
      this._priceScale = null;
    },
  });

  useLayoutEffect(() => {
    if (!chartInitialized) return;

    priceScaleApiRef.current.init();
  }, [chartInitialized]);

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
