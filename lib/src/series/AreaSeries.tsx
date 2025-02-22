import { ForwardedRef, forwardRef } from "react";
import SeriesTemplate from "./SeriesTemplate";
import { SeriesApiRef, SeriesProps } from "./types";

const AreaSeriesRenderFunction = (
  { children, ...rest }: SeriesProps<"Area">,
  ref: ForwardedRef<SeriesApiRef<"Area">>
) => {
  return (
    <SeriesTemplate type="Area" ref={ref} {...rest}>
      {children}
    </SeriesTemplate>
  );
};

const AreaSeries = forwardRef(AreaSeriesRenderFunction);
AreaSeries.displayName = "AreaSeries";
export default AreaSeries;
