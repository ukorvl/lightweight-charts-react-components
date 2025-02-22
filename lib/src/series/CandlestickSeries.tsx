import { ForwardedRef, forwardRef } from "react";
import SeriesTemplate from "./SeriesTemplate";
import { SeriesApiRef, SeriesProps } from "./types";

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
export default CandlestickSeries;
