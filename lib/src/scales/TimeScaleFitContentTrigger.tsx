import { useTimeScaleFitContentTrigger } from "./useTimeScaleFitContentTrigger";
import type { TimeScaleFitContentTriggerProps } from "./types";
import type { JSX } from "react";

/**
 * TimeScaleFitContentTrigger component that triggers a fit content operation on the time scale.
 *
 * @param props - The properties for the time scale fit content trigger.
 * @returns A React component that triggers a fit content operation on the time scale.
 * @see {@link https://ukorvl.github.io/lightweight-charts-react-components/docs/time-scale-fit-content-trigger | Time Scale Fit Content Trigger documentation}
 * @example
 * ```tsx
 * <TimeScaleFitContentTrigger deps={[...]} />
 * ```
 */
export const TimeScaleFitContentTrigger = ({
  deps,
}: TimeScaleFitContentTriggerProps): JSX.Element | null => {
  useTimeScaleFitContentTrigger({ deps });

  return null;
};
