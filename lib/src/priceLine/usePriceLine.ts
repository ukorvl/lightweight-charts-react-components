import { useLayoutEffect, useRef } from "react";
import { PriceLineApiRef, PriceLineProps } from "./types";
import { useSafeContext } from "@/shared/useSafeContext";
import { SeriesContext } from "@/series/SeriesContext";

export const usePriceLine = ({ options, price }: PriceLineProps) => {
  const { initialized: seriesInitialized, seriesApiRef: series } =
    useSafeContext(SeriesContext);

  const priceLineApiRef = useRef<PriceLineApiRef>({
    _priceLine: null,
    api() {
      return this._priceLine;
    },
    init() {
      if (!this._priceLine) {
        const seriesApi = series?.api();

        if (!seriesApi) {
          return null;
        }

        this._priceLine = seriesApi.createPriceLine({
          price,
          ...options,
        });
      }

      return this._priceLine;
    },
    clear() {
      if (this._priceLine !== null) {
        series?.api()?.removePriceLine(this._priceLine);
        this._priceLine = null;
      }
    },
  });

  useLayoutEffect(() => {
    if (!seriesInitialized) return;

    priceLineApiRef.current.init();
  }, [seriesInitialized]);

  useLayoutEffect(() => {
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
