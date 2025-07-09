import { useTimeScaleFitContentTrigger } from "./useTimeScaleFitContentTrigger";
import type { TimeScaleFitContentTriggerProps } from "./types";
import type { JSX } from "react";

const TimeScaleFitContentTrigger = ({
  deps,
}: TimeScaleFitContentTriggerProps): JSX.Element | null => {
  useTimeScaleFitContentTrigger({ deps });

  return null;
};

export { TimeScaleFitContentTrigger };
