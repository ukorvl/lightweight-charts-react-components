import { forwardRef, useImperativeHandle } from "react";
import { useMarkers } from "./useMarkers";
import type { MarkersApiRef, MarkersProps } from "./types";
import type { ForwardedRef } from "react";

const MarkersRenderFunction = (
  { ...rest }: MarkersProps,
  ref: ForwardedRef<MarkersApiRef>
) => {
  const markersApiRef = useMarkers(rest);
  useImperativeHandle(ref, () => markersApiRef.current, [markersApiRef]);

  return null;
};

const Markers = forwardRef(MarkersRenderFunction);
Markers.displayName = "Markers";
export { Markers };
