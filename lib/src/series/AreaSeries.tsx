import { forwardRef } from "react";
import React from "react";
import { SeriesTemplate } from "./SeriesTemplate";
import type { SeriesApiRef, SeriesProps } from "./types";
import type { ForwardedRef, ForwardRefExoticComponent, JSX, RefAttributes } from "react";

const AreaSeriesRenderFunction = (
  { children, ...rest }: SeriesProps<"Area">,
  ref: ForwardedRef<SeriesApiRef<"Area">>
): JSX.Element => {
  return (
    <SeriesTemplate type="Area" ref={ref} {...rest}>
      {children}
    </SeriesTemplate>
  );
};

const AreaSeries: ForwardRefExoticComponent<
  SeriesProps<"Area"> & RefAttributes<SeriesApiRef<"Area">>
> = forwardRef(AreaSeriesRenderFunction);
AreaSeries.displayName = "AreaSeries";
export { AreaSeries };
