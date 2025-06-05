import { forwardRef, useImperativeHandle } from "react";
import { useMarkers } from "./useMarkers";
import type { MarkersApiRef, MarkersProps } from "./types";
import type { ForwardedRef, ForwardRefExoticComponent, RefAttributes } from "react";

const MarkersRenderFunction = (
  { ...rest }: MarkersProps,
  ref: ForwardedRef<MarkersApiRef>
): null => {
  const markersApiRef = useMarkers(rest);
  useImperativeHandle(ref, () => markersApiRef.current, [markersApiRef]);

  return null;
};

const Markers: ForwardRefExoticComponent<MarkersProps & RefAttributes<MarkersApiRef>> =
  forwardRef(MarkersRenderFunction);
Markers.displayName = "Markers";
export { Markers };
