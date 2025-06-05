import { forwardRef } from "react";
import { SeriesTemplate } from "./SeriesTemplate";
import type { SeriesApiRef, SeriesProps } from "./types";
import type { ForwardedRef, ForwardRefExoticComponent, JSX, RefAttributes } from "react";

const HistogramSeriesRenderFunction = (
  { children, ...rest }: SeriesProps<"Histogram">,
  ref: ForwardedRef<SeriesApiRef<"Histogram">>
): JSX.Element => {
  return (
    <SeriesTemplate type="Histogram" ref={ref} {...rest}>
      {children}
    </SeriesTemplate>
  );
};

const HistogramSeries: ForwardRefExoticComponent<
  SeriesProps<"Histogram"> & RefAttributes<SeriesApiRef<"Histogram">>
> = forwardRef(HistogramSeriesRenderFunction);
HistogramSeries.displayName = "HistogramSeries";
export { HistogramSeries };
