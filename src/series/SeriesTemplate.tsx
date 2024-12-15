import { useInitSeries } from "./useInitSeries";
import { SeriesType, SeriesTemplateProps, SeriesApiRef } from "./types";
import { SeriesContext } from "./SeriesContext";
import { ForwardedRef, forwardRef, useImperativeHandle } from "react";

const SeriesTemplateRenderFunction = <T extends SeriesType = "Line">(
  { children, ...rest }: SeriesTemplateProps<T>,
  ref: ForwardedRef<SeriesApiRef<T>>
) => {
  const seriesApi = useInitSeries(rest);
  useImperativeHandle(ref, () => seriesApi.current, [seriesApi]);

  return <SeriesContext.Provider value={seriesApi.current}>{children}</SeriesContext.Provider>;
};

const SeriesTemplate = forwardRef(SeriesTemplateRenderFunction);
SeriesTemplate.displayName = "SeriesTemplate";
export default SeriesTemplate;
