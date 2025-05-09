import { useLayoutEffect } from "react";
import { useSafeContext } from "@/_shared/useSafeContext";
import { TimeScaleContext } from "./TimeScaleContext";
import type { TimeScaleFitContentTriggerProps } from "./types";

const useTimeScaleFitContentTrigger = ({ deps }: TimeScaleFitContentTriggerProps) => {
  const timeScaleContext = useSafeContext(TimeScaleContext);
  const { timeScaleApiRef, isReady } = timeScaleContext;

  useLayoutEffect(() => {
    if (!isReady || !timeScaleApiRef) {
      return;
    }

    const timeScale = timeScaleApiRef.api();
    queueMicrotask(() => {
      if (timeScale) {
        timeScale.fitContent();
      }
    });
  }, [...deps, isReady]);
};

export { useTimeScaleFitContentTrigger };
