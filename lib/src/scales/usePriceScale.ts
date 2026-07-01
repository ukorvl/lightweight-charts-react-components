import { useEffect, useRef } from "react";
import { useSafeContext } from "@/_shared/useSafeContext";
import { ChartContext } from "@/chart/ChartContext";
import { usePaneContext } from "@/pane/usePaneContext";
import type { PriceScaleProps, PriceScaleApiRef } from "./types";

export const usePriceScale = ({ options = {}, id }: PriceScaleProps) => {
  const { isReady: chartIsReady, chartApiRef: chart } = useSafeContext(ChartContext);
  const { isInsidePane, isPaneReady, paneApiRef } = usePaneContext();
  const chartRef = useRef(chart);
  const paneRef = useRef(paneApiRef);
  const idRef = useRef(id);
  const optionsRef = useRef(options);

  chartRef.current = chart;
  paneRef.current = paneApiRef;
  idRef.current = id;
  optionsRef.current = options;

  const priceScaleApiRef = useRef<PriceScaleApiRef>({
    _priceScale: null,
    api() {
      return this._priceScale;
    },
    init() {
      return this._priceScale;
    },
    setId() {},
    clear() {
      this._priceScale = null;
    },
  });

  const resolvePriceScale = (idToResolve: string) => {
    const chartApi = chartRef.current?.api();

    if (!chartApi) {
      return null;
    }

    const paneIndex = paneRef.current?.api()?.paneIndex() ?? 0;
    return chartApi.priceScale(idToResolve, paneIndex);
  };

  priceScaleApiRef.current.init = function initPriceScale() {
    if (this._priceScale) {
      return this._priceScale;
    }

    const priceScale = resolvePriceScale(idRef.current);

    if (!priceScale) {
      return null;
    }

    this._priceScale = priceScale;
    this._priceScale.applyOptions(optionsRef.current);

    return this._priceScale;
  };

  priceScaleApiRef.current.setId = function setPriceScaleId(idToSet) {
    const priceScale = resolvePriceScale(idToSet);

    if (!priceScale) {
      return;
    }

    this._priceScale = priceScale;
    this._priceScale.applyOptions(optionsRef.current);
  };
  const isPriceScaleReady = chartIsReady && (!isInsidePane || isPaneReady);

  useEffect(() => {
    if (!chart || !isPriceScaleReady) {
      return;
    }

    if (priceScaleApiRef.current.api() === null) {
      priceScaleApiRef.current.init();
      return;
    }

    priceScaleApiRef.current.setId(id);
  }, [chart, id, isPriceScaleReady]);

  useEffect(() => {
    return () => {
      priceScaleApiRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!chart || !isPriceScaleReady) return;

    if (options) {
      priceScaleApiRef.current?.api()?.applyOptions(options);
    }
  }, [chart, isPriceScaleReady, options]);

  return priceScaleApiRef;
};
