import { MutableRefObject } from "react";
import { ChartApiRef } from "./types";
import debounce from "lodash.debounce";
import { useOnWindowResize } from "../../shared/hooks/useOnWindowResize";

export const useHandleChartResize = (
  chartApiRef: MutableRefObject<ChartApiRef>,
  autoResizeEnabled: boolean,
  container?: HTMLElement
) => {
  const handleResize = debounce(() => {
    if (!container) return;

    if (!autoResizeEnabled) return;

    chartApiRef.current?.api()?.applyOptions({
      width: container.clientWidth,
      height: container.clientHeight,
    });
  }, 100);

  useOnWindowResize(handleResize);
};
