import { forwardRef, useImperativeHandle } from "react";
import React from "react";
import { SeriesContext } from "./SeriesContext";
import { useSeries } from "./useSeries";
import type { SeriesTemplateProps, SeriesApiRef } from "./types";
import type { SeriesType, Time } from "lightweight-charts";
import type { ForwardedRef } from "react";

type GenericSeriesComponent = (<T extends SeriesType, HorzScaleItem = Time>(
  props: SeriesTemplateProps<T, HorzScaleItem> & {
    ref?: ForwardedRef<SeriesApiRef<T, HorzScaleItem>>;
  }
) => ReturnType<typeof SeriesTemplateRenderFunction>) & {
  displayName: string;
};

const SeriesTemplateRenderFunction = <T extends SeriesType, HorzScaleItem = Time>(
  { children, ...rest }: SeriesTemplateProps<T, HorzScaleItem>,
  ref: ForwardedRef<SeriesApiRef<T, HorzScaleItem>>
) => {
  const {
    seriesApiRef: { current: seriesApiRef },
    isReady,
  } = useSeries(rest);
  useImperativeHandle(ref, () => seriesApiRef, [seriesApiRef]);

  return (
    <SeriesContext.Provider
      value={{
        seriesApiRef: seriesApiRef as never,
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
