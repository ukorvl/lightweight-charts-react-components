import { forwardRef, useImperativeHandle } from "react";
import React from "react";
import { SeriesContext } from "./SeriesContext";
import { useSeries } from "./useSeries";
import type { SeriesTemplateProps, SeriesApiRef } from "./types";
import type { SeriesType } from "lightweight-charts";
import type { ForwardedRef } from "react";

type GenericSeriesComponent = (<T extends SeriesType>(
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
    isReady,
  } = useSeries(rest);
  useImperativeHandle(ref, () => seriesApiRef, [seriesApiRef]);

  return (
    <SeriesContext.Provider
      value={{
        seriesApiRef,
        isReady,
      }}
    >
      {children}
    </SeriesContext.Provider>
  );
};

const SeriesTemplate = forwardRef(SeriesTemplateRenderFunction) as GenericSeriesComponent;
SeriesTemplate.displayName = "SeriesTemplate";
export { SeriesTemplate };
