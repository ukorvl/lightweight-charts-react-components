import { ForwardedRef, forwardRef, useImperativeHandle } from "react";
import { TimeScaleApiRef, TimeScaleProps } from "./types";
import { useInitTimeScale } from "./useInitTimeScale";

const TimeScaleRenderFunction = (props: TimeScaleProps, ref: ForwardedRef<TimeScaleApiRef>) => {
  const timeScaleApiRef = useInitTimeScale(props);
  useImperativeHandle(ref, () => timeScaleApiRef.current, [timeScaleApiRef]);

  return null;
};

const TimeScale = forwardRef(TimeScaleRenderFunction);
TimeScale.displayName = "TimeScale";
export default TimeScale;
