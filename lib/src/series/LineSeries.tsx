import { forwardRef } from "react";
import { SeriesTemplate } from "./SeriesTemplate";
import type { SeriesApiRef, SeriesProps } from "./types";
import type { ForwardedRef } from "react";

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
export { LineSeries };
