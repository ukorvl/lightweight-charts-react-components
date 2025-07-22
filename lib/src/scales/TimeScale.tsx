import { forwardRef, useImperativeHandle } from "react";
import React from "react";
import { TimeScaleContext } from "./TimeScaleContext";
import { useTimeScale } from "./useTimeScale";
import type { TimeScaleApiRef, TimeScaleProps } from "./types";
import type { ForwardedRef, ForwardRefExoticComponent, JSX, RefAttributes } from "react";

const TimeScaleRenderFunction = (
  { children, ...props }: TimeScaleProps,
  ref: ForwardedRef<TimeScaleApiRef>
): JSX.Element => {
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

/**
 * TimeScale component that can be used to create/customize time scale in a chart.
 *
 * @param props - The properties for the time scale.
 * @param ref - The ref to access the time scale API.
 * @returns A React component that renders the time scale.
 * @see {@link https://ukorvl.github.io/lightweight-charts-react-components/docs/time-scale | Time Scale documentation}
 * @see {@link https://tradingview.github.io/lightweight-charts/docs/time-scale | TradingView documentation for time scale}
 * @example
 * ```tsx
 * <TimeScale visibleRange={{ from: 0, to: 100 }} onVisibleRangeChanged={() => {}} />
 * ```
 */
export const TimeScale: ForwardRefExoticComponent<
  TimeScaleProps & RefAttributes<TimeScaleApiRef>
> = forwardRef(TimeScaleRenderFunction);
TimeScale.displayName = "TimeScale";
