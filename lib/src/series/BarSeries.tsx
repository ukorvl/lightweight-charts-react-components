import { forwardRef } from "react";
import React from "react";
import { SeriesTemplate } from "./SeriesTemplate";
import type { SeriesApiRef, SeriesProps } from "./types";
import type { ForwardedRef, ForwardRefExoticComponent, JSX, RefAttributes } from "react";

const BarSeriesRenderFunction = (
  { children, ...rest }: SeriesProps<"Bar">,
  ref: ForwardedRef<SeriesApiRef<"Bar">>
): JSX.Element => {
  return (
    <SeriesTemplate type="Bar" ref={ref} {...rest}>
      {children}
    </SeriesTemplate>
  );
};

const BarSeries: ForwardRefExoticComponent<
  SeriesProps<"Bar"> & RefAttributes<SeriesApiRef<"Bar">>
> = forwardRef(BarSeriesRenderFunction);
BarSeries.displayName = "BarSeries";
export { BarSeries };
