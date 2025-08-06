import { forwardRef, useImperativeHandle } from "react";
import { useMarkers } from "./useMarkers";
import type { MarkersApiRef, MarkersProps } from "./types";
import type { ForwardedRef, ForwardRefExoticComponent, JSX, RefAttributes } from "react";

const MarkersRenderFunction = (
  { ...rest }: MarkersProps,
  ref: ForwardedRef<MarkersApiRef>
): JSX.Element | null => {
  const markersApiRef = useMarkers(rest);
  useImperativeHandle(ref, () => markersApiRef.current, [markersApiRef]);

  return null;
};

/**
 * Markers component that can be used to add markers to a chart pane.
 *
 * @param props - The properties for the markers.
 * @param ref - The ref to access the markers API.
 * @returns A React component that renders the markers.
 * @see {@link https://ukorvl.github.io/lightweight-charts-react-components/docs/markers | Documentation for Markers}
 * @see {@link https://tradingview.github.io/lightweight-charts/tutorials/how_to/series-markers | TradingView documentation for markers}
 * @example
 * ```tsx
 * <Markers
 *  markers={[
 *    { time: 1622548800, position: "aboveBar", color: "red", shape: "arrowUp" },
 *    { time: 1622548800, position: "belowBar", color: "green", shape: "arrowDown" },
 *  ]}
 * />
 * ```
 */
export const Markers: ForwardRefExoticComponent<
  MarkersProps & RefAttributes<MarkersApiRef>
> = forwardRef(MarkersRenderFunction);
Markers.displayName = "Markers";
