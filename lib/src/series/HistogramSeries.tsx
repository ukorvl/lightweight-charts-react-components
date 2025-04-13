import { forwardRef } from "react";
import { SeriesTemplate } from "./SeriesTemplate";
import type { SeriesApiRef, SeriesProps } from "./types";
import type { ForwardedRef } from "react";

const HistogramSeriesRenderFunction = (
  { children, ...rest }: SeriesProps<"Histogram">,
  ref: ForwardedRef<SeriesApiRef<"Histogram">>
) => {
  return (
    <SeriesTemplate type="Histogram" ref={ref} {...rest}>
      {children}
    </SeriesTemplate>
  );
};

const HistogramSeries = forwardRef(HistogramSeriesRenderFunction);
HistogramSeries.displayName = "HistogramSeries";
export { HistogramSeries };
