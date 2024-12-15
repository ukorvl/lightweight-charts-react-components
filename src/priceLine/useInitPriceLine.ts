import { useContext, useLayoutEffect, useRef } from "react";
import { PriceLineApiRef, PriceLineProps } from "./types";
import { SeriesContext } from "../series/SeriesContext";
import { priceLineDefaultOptions } from "./priceLineDefaultOptions";

export const useInitPriceLine = ({ options, price }: PriceLineProps) => {
  const series = useContext(SeriesContext);

  if (!series) {
    throw new Error("Series context not found");
  }

  const priceLineApiRef = useRef<PriceLineApiRef>({
    _priceLine: null,
    api() {
      if (!this._priceLine) {
        const seriesApi = series.api();

        if (!seriesApi) {
          return null;
        }

        this._priceLine = seriesApi.createPriceLine({
          price,
          ...priceLineDefaultOptions,
          ...options,
        });
      }

      return this._priceLine;
    },
    clear() {
      if (this._priceLine !== null) {
        series.api()?.removePriceLine(this._priceLine);
        this._priceLine = null;
      }
    },
  });

  useLayoutEffect(() => {
    priceLineApiRef.current.api();

    return () => {
      priceLineApiRef.current.clear();
    };
  }, []);

  useLayoutEffect(() => {
    if (!series) return;

    if (options) {
      priceLineApiRef.current.api()?.applyOptions(options);
    }
  }, [options]);

  return priceLineApiRef;
};
