import { forwardRef } from "react";
import { SeriesTemplate } from "./SeriesTemplate";
import type { SeriesApiRef, SeriesProps } from "./types";
import type { ForwardedRef, ForwardRefExoticComponent, JSX, RefAttributes } from "react";

const LineSeriesRenderFunction = (
  { children, ...rest }: SeriesProps<"Line">,
  ref: ForwardedRef<SeriesApiRef<"Line">>
): JSX.Element => {
  return (
    <SeriesTemplate type="Line" ref={ref} {...rest}>
      {children}
    </SeriesTemplate>
  );
};

const LineSeries: ForwardRefExoticComponent<
  SeriesProps<"Line"> & RefAttributes<SeriesApiRef<"Line">>
> = forwardRef(LineSeriesRenderFunction);
LineSeries.displayName = "LineSeries";
export { LineSeries };
