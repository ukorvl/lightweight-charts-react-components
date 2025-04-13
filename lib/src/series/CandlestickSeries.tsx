import { forwardRef } from "react";
import { SeriesTemplate } from "./SeriesTemplate";
import type { SeriesApiRef, SeriesProps } from "./types";
import type { ForwardedRef } from "react";

const CandlestickSeriesRenderFunction = (
  { children, ...rest }: SeriesProps<"Candlestick">,
  ref: ForwardedRef<SeriesApiRef<"Candlestick">>
) => {
  return (
    <SeriesTemplate type="Candlestick" ref={ref} {...rest}>
      {children}
    </SeriesTemplate>
  );
};

const CandlestickSeries = forwardRef(CandlestickSeriesRenderFunction);
CandlestickSeries.displayName = "CandlestickSeries";
export { CandlestickSeries };
