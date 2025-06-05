import { forwardRef } from "react";
import { SeriesTemplate } from "./SeriesTemplate";
import type { SeriesApiRef, SeriesProps } from "./types";
import type { ForwardedRef, ForwardRefExoticComponent, JSX, RefAttributes } from "react";

const CandlestickSeriesRenderFunction = (
  { children, ...rest }: SeriesProps<"Candlestick">,
  ref: ForwardedRef<SeriesApiRef<"Candlestick">>
): JSX.Element => {
  return (
    <SeriesTemplate type="Candlestick" ref={ref} {...rest}>
      {children}
    </SeriesTemplate>
  );
};

const CandlestickSeries: ForwardRefExoticComponent<
  SeriesProps<"Candlestick"> & RefAttributes<SeriesApiRef<"Candlestick">>
> = forwardRef(CandlestickSeriesRenderFunction);
CandlestickSeries.displayName = "CandlestickSeries";
export { CandlestickSeries };
