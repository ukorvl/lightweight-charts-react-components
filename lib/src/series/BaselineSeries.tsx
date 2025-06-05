import { forwardRef } from "react";
import { SeriesTemplate } from "./SeriesTemplate";
import type { SeriesApiRef, SeriesProps } from "./types";
import type { ForwardedRef, ForwardRefExoticComponent, JSX, RefAttributes } from "react";

const BaselineSeriesRenderFunction = (
  { children, ...rest }: SeriesProps<"Baseline">,
  ref: ForwardedRef<SeriesApiRef<"Baseline">>
): JSX.Element => {
  return (
    <SeriesTemplate type="Baseline" ref={ref} {...rest}>
      {children}
    </SeriesTemplate>
  );
};

const BaselineSeries: ForwardRefExoticComponent<
  SeriesProps<"Baseline"> & RefAttributes<SeriesApiRef<"Baseline">>
> = forwardRef(BaselineSeriesRenderFunction);
BaselineSeries.displayName = "BaselineSeries";
export { BaselineSeries };
