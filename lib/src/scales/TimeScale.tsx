import { ForwardedRef, forwardRef, useImperativeHandle } from "react";
import { TimeScaleApiRef, TimeScaleProps } from "./types";
import { useTimeScale } from "./useTimeScale";

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
export default TimeScale;
