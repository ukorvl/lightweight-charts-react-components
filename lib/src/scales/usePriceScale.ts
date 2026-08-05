import { useEffect, useRef } from "react";
import { BaseInternalError } from "@/_shared/InternalError";
import { useSafeContext } from "@/_shared/useSafeContext";
import { ChartContext } from "@/chart/ChartContext";
import { usePaneContext } from "@/pane/usePaneContext";
import type { PriceScaleProps, PriceScaleApiRef } from "./types";

const incorrectPriceScaleIdErrorMessage =
  "Trying to apply price scale options with incorrect ID:";

const isIncorrectPriceScaleIdError = (error: unknown): error is Error =>
  error instanceof Error && error.message.includes(incorrectPriceScaleIdErrorMessage);

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

  const getCurrentPaneIndex = () => paneRef.current?.api()?.paneIndex() ?? 0;

  const resolvePriceScale = (idToResolve: string) => {
    const chartApi = chartRef.current?.api();

    if (!chartApi) {
      return null;
    }

    const paneIndex = getCurrentPaneIndex();
    return chartApi.priceScale(idToResolve, paneIndex);
  };

  const applyPriceScaleOptions = (
    priceScale: NonNullable<PriceScaleApiRef["_priceScale"]>,
    idToApply: string,
    optionsToApply: NonNullable<PriceScaleProps["options"]>
  ) => {
    try {
      priceScale.applyOptions(optionsToApply);
    } catch (error) {
      if (isIncorrectPriceScaleIdError(error)) {
        const paneIndex = getCurrentPaneIndex();
        const paneLabel = paneIndex === 0 ? "the root pane" : `pane ${paneIndex}`;

        throw new BaseInternalError(
          `PriceScale id "${idToApply}" could not be configured because no series in ${paneLabel} is using that price scale. For custom scales, set a series options.priceScaleId to "${idToApply}" and render PriceScale with the same id in that pane. Use "left" or "right" for the default pane scales.`,
          {
            cause: error,
            docsPath: "price-scale",
            isOperational: true,
          }
        );
      }

      throw error;
    }
  };

  const initPriceScale = function initPriceScale(this: PriceScaleApiRef) {
    if (this._priceScale) {
      return this._priceScale;
    }

    const priceScale = resolvePriceScale(idRef.current);

    if (!priceScale) {
      return null;
    }

    this._priceScale = priceScale;
    applyPriceScaleOptions(this._priceScale, idRef.current, optionsRef.current);

    return this._priceScale;
  };

  const setPriceScaleId = function setPriceScaleId(
    this: PriceScaleApiRef,
    idToSet: string
  ) {
    const priceScale = resolvePriceScale(idToSet);

    if (!priceScale) {
      return;
    }

    this._priceScale = priceScale;
    applyPriceScaleOptions(this._priceScale, idToSet, optionsRef.current);
  };

  const priceScaleApiRef = useRef<PriceScaleApiRef>({
    _priceScale: null,
    api() {
      return this._priceScale;
    },
    init: initPriceScale,
    setId: setPriceScaleId,
    clear() {
      this._priceScale = null;
    },
  });

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

    const priceScale = priceScaleApiRef.current?.api();

    if (!priceScale) {
      return;
    }

    applyPriceScaleOptions(priceScale, idRef.current, options);
  }, [chart, isPriceScaleReady, options]);

  return priceScaleApiRef;
};
