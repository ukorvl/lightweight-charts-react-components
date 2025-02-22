import { ForwardedRef, forwardRef } from "react";
import SeriesTemplate from "./SeriesTemplate";
import { SeriesApiRef, SeriesProps } from "./types";

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
export default HistogramSeries;
