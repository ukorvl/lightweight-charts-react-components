import { forwardRef } from "react";
import SeriesTemplate from "./SeriesTemplate";
import type { SeriesApiRef, SeriesProps } from "./types";
import type { ForwardedRef } from "react";

const CustomSeriesRenderFunction = (
  { children, ...rest }: SeriesProps<"Custom">,
  ref: ForwardedRef<SeriesApiRef<"Custom">>
) => {
  return (
    <SeriesTemplate type="Custom" ref={ref} {...rest}>
      {children}
    </SeriesTemplate>
  );
};

const CustomSeries = forwardRef(CustomSeriesRenderFunction);
CustomSeries.displayName = "CustomSeries";
export default CustomSeries;
