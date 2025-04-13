import { forwardRef } from "react";
import { SeriesTemplate } from "./SeriesTemplate";
import type { SeriesApiRef, SeriesProps } from "./types";
import type { ForwardedRef } from "react";

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
export { AreaSeries };
