import { forwardRef } from "react";
import { SeriesTemplate } from "./SeriesTemplate";
import type { SeriesApiRef, SeriesProps } from "./types";
import type { ForwardedRef, ForwardRefExoticComponent, JSX, RefAttributes } from "react";

const CustomSeriesRenderFunction = (
  { children, ...rest }: SeriesProps<"Custom">,
  ref: ForwardedRef<SeriesApiRef<"Custom">>
): JSX.Element => {
  return (
    <SeriesTemplate type="Custom" ref={ref} {...rest}>
      {children}
    </SeriesTemplate>
  );
};

const CustomSeries: ForwardRefExoticComponent<
  SeriesProps<"Custom"> & RefAttributes<SeriesApiRef<"Custom">>
> = forwardRef(CustomSeriesRenderFunction);
CustomSeries.displayName = "CustomSeries";
export { CustomSeries };
