import { forwardRef } from "react";
import SeriesTemplate from "./SeriesTemplate";
import type { SeriesApiRef, SeriesProps } from "./types";
import type { ForwardedRef } from "react";

const BarSeriesRenderFunction = (
  { children, ...rest }: SeriesProps<"Bar">,
  ref: ForwardedRef<SeriesApiRef<"Bar">>
) => {
  return (
    <SeriesTemplate type="Bar" ref={ref} {...rest}>
      {children}
    </SeriesTemplate>
  );
};

const BarSeries = forwardRef(BarSeriesRenderFunction);
BarSeries.displayName = "BarSeries";
export default BarSeries;
