import { forwardRef, useImperativeHandle } from "react";
import { TimeScaleContext } from "./TimeScaleContext";
import { useTimeScale } from "./useTimeScale";
import type { TimeScaleApiRef, TimeScaleProps } from "./types";
import type { ForwardedRef } from "react";

const TimeScaleRenderFunction = (
  { children, ...props }: TimeScaleProps,
  ref: ForwardedRef<TimeScaleApiRef>
) => {
  const {
    timeScaleApiRef: { current: timeScaleApiRef },
    isReady,
  } = useTimeScale(props);
  useImperativeHandle(ref, () => timeScaleApiRef, [timeScaleApiRef]);

  return (
    <TimeScaleContext.Provider
      value={{
        timeScaleApiRef,
        isReady,
      }}
    >
      {children}
    </TimeScaleContext.Provider>
  );
};

const TimeScale = forwardRef(TimeScaleRenderFunction);
TimeScale.displayName = "TimeScale";
export { TimeScale };
