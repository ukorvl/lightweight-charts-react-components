import { forwardRef, useImperativeHandle } from "react";
import { useTimeScale } from "./useTimeScale";
import type { TimeScaleApiRef, TimeScaleProps } from "./types";
import type { ForwardedRef } from "react";

const TimeScaleRenderFunction = (
  props: TimeScaleProps,
  ref: ForwardedRef<TimeScaleApiRef>
) => {
  const timeScaleApiRef = useTimeScale(props);
  useImperativeHandle(ref, () => timeScaleApiRef.current, [timeScaleApiRef]);

  return null;
};

const TimeScale = forwardRef(TimeScaleRenderFunction);
TimeScale.displayName = "TimeScale";
export { TimeScale };
