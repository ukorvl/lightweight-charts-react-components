import { useContext, useLayoutEffect, useRef } from "react";
import { ChartContext } from "../ChartContext";
import { PriceScaleProps, PriceScaleApiRef } from "./types";
import { priceScaleDefaultOptions } from "./scalesDefaultOptions";

export const useInitPriceScale = ({ options, id }: PriceScaleProps) => {
  const chart = useContext(ChartContext);

  if (!chart) {
    throw new Error("Chart context not found");
  }

  const priceScaleApiRef = useRef<PriceScaleApiRef>({
    _priceScale: null,
    api() {
      if (!this._priceScale) {
        const chartApi = chart.api();

        if (!chartApi) {
          return null;
        }

        this._priceScale = chartApi.priceScale(id);

        this._priceScale.applyOptions({
          ...priceScaleDefaultOptions,
          ...options,
        });
      }

      return this._priceScale;
    },
    setId(id) {
      if (this._priceScale === null) {
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this._priceScale = chart.api()!.priceScale(id);
    },
    clear() {
      if (this._priceScale !== null) {
        this._priceScale = null;
      }
    },
  });

  useLayoutEffect(() => {
    priceScaleApiRef.current.api();

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
