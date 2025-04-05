import { forwardRef, useImperativeHandle } from "react";
import { SeriesContext } from "./SeriesContext";
import { useSeries } from "./useSeries";
import type { SeriesType, SeriesTemplateProps, SeriesApiRef } from "./types";
import type { ForwardedRef } from "react";

type GenericRefComponent = (<T extends SeriesType>(
  props: SeriesTemplateProps<T> & {
    ref?: ForwardedRef<SeriesApiRef<T>>;
  }
) => ReturnType<typeof SeriesTemplateRenderFunction>) & {
  displayName: string;
};

const SeriesTemplateRenderFunction = <T extends SeriesType>(
  { children, ...rest }: SeriesTemplateProps<T>,
  ref: ForwardedRef<SeriesApiRef<T>>
) => {
  const {
    seriesApiRef: { current: seriesApiRef },
    initialized,
  } = useSeries(rest);
  useImperativeHandle(ref, () => seriesApiRef, [seriesApiRef]);

  return (
    <SeriesContext.Provider
      value={{
        seriesApiRef,
        initialized,
      }}
    >
      {children}
    </SeriesContext.Provider>
  );
};

const SeriesTemplate = forwardRef(SeriesTemplateRenderFunction) as GenericRefComponent;

SeriesTemplate.displayName = "SeriesTemplate";
export default SeriesTemplate;
