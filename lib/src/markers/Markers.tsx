import { ForwardedRef, forwardRef, useImperativeHandle } from "react";
import { MarkersApiRef, MarkersProps } from "./types";
import { useInitMarkers } from "./useInitMarkers";

const MarkersRenderFunction = (
  { ...rest }: MarkersProps,
  ref: ForwardedRef<MarkersApiRef>,
) => {
  const markersApiRef = useInitMarkers(rest);
  useImperativeHandle(ref, () => markersApiRef.current, [markersApiRef]);

  return null;
};

const Markers = forwardRef(MarkersRenderFunction);
Markers.displayName = "Markers";
export default Markers;
