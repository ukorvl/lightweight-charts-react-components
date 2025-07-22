import { forwardRef, useImperativeHandle } from "react";
import { useSeriesPrimitive } from "./useSeriesPrimitive";
import type { SeriesPrimitiveApiRef, SeriesPrimitiveProps } from "./types";
import type { SeriesType } from "lightweight-charts";
import type { ForwardedRef, JSX } from "react";

type GenericSeriesPrimitiveComponent = (<T extends SeriesType>(
  props: SeriesPrimitiveProps<T> & {
    ref?: ForwardedRef<SeriesPrimitiveApiRef>;
  }
) => ReturnType<typeof SeriesPrimitiveRenderFunction>) & {
  displayName: string;
};

const SeriesPrimitiveRenderFunction = <T extends SeriesType>(
  props: SeriesPrimitiveProps<T>,
  ref: ForwardedRef<SeriesPrimitiveApiRef>
): JSX.Element | null => {
  const seriesPrimitiveApiRef = useSeriesPrimitive(props);
  useImperativeHandle(ref, () => seriesPrimitiveApiRef.current, [seriesPrimitiveApiRef]);

  return null;
};

/**
 * SeriesPrimitive component that can be used to create a primitive on series.
 *
 * @param props - The properties for the series primitive.
 * @param ref - The ref to access the series primitive API.
 * @returns A React component that renders the series primitive.
 * @see {@link https://ukorvl.github.io/lightweight-charts-react-components/docs/series-primitives | Series primitives documentation}
 * @see {@link https://tradingview.github.io/lightweight-charts/docs/plugins/series-primitives | TradingView documentation for series primitive}
 * @example
 * ```tsx
 * <SeriesPrimitive render={{}} />
 * <SeriesPrimitive plugin={{}} />
 * ```
 */
export const SeriesPrimitive = forwardRef(
  SeriesPrimitiveRenderFunction
) as GenericSeriesPrimitiveComponent;
SeriesPrimitive.displayName = "SeriesPrimitive";
