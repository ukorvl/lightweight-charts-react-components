import { ForwardedRef, forwardRef } from "react";
import SeriesTemplate from "./SeriesTemplate";
import { SeriesApiRef, SeriesProps } from "./types";

const BaselineSeriesRenderFunction = (
  { children, ...rest }: SeriesProps<"Baseline">,
  ref: ForwardedRef<SeriesApiRef<"Baseline">>,
) => {
  return (
    <SeriesTemplate type="Baseline" ref={ref} {...rest}>
      {children}
    </SeriesTemplate>
  );
};

const BaselineSeries = forwardRef(BaselineSeriesRenderFunction);
BaselineSeries.displayName = "BaselineSeries";
export default BaselineSeries;
