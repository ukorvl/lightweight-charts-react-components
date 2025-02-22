import { ForwardedRef, forwardRef } from "react";
import SeriesTemplate from "./SeriesTemplate";
import { SeriesApiRef, SeriesProps } from "./types";

const LineSeriesRenderFunction = (
  { children, ...rest }: SeriesProps<"Line">,
  ref: ForwardedRef<SeriesApiRef<"Line">>
) => {
  return (
    <SeriesTemplate type="Line" ref={ref} {...rest}>
      {children}
    </SeriesTemplate>
  );
};

const LineSeries = forwardRef(LineSeriesRenderFunction);
LineSeries.displayName = "LineSeries";
export default LineSeries;
