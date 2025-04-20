import { useCallback, useRef, useState } from "react";
import { useSize } from "@/common/useSize";
import type {
  LineData,
  MouseEventHandler,
  MouseEventParams,
  Time,
} from "lightweight-charts";
import type { SeriesApiRef } from "lightweight-charts-react-components";
import type { RefObject } from "react";

type BasicTooltipData = {
  show: boolean;
  price: string;
  time?: string;
  position: {
    x: number | null;
    y: number | null;
  };
};

type MultipleSeriesTooltipData = {
  show: boolean;
  data: Map<number, string> | null;
  time?: string;
  position: {
    x: number | null;
    y: number | null;
  };
};

type Options = {
  tooltipWidth: number;
  tooltipHeight: number;
  yOffset?: number;
  xOffset?: number;
};

const getTooltipPosition = (
  param: MouseEventParams,
  containerWidth: number,
  containerHeight: number,
  o: Options
) => {
  const { tooltipHeight, tooltipWidth, yOffset = 10, xOffset = 10 } = o;
  const x = param.point!.x + xOffset;
  const y = param.point!.y + yOffset;
  const xOverflow = x > containerWidth - tooltipWidth;
  const yOverflow = y > containerHeight - tooltipHeight;

  return {
    x: xOverflow ? x - tooltipWidth - xOffset * 2 : x,
    y: yOverflow ? y - tooltipHeight - yOffset * 2 : y,
  };
};

const getShowTooltip = (param: MouseEventParams) => {
  return (
    param.time !== undefined &&
    param.point !== undefined &&
    param.point?.x > 0 &&
    param.point?.y > 0
  );
};

const useBasicTooltip = (
  containerRef: RefObject<HTMLElement | null>,
  options: Options
) => {
  const seriesRef = useRef<SeriesApiRef<"Line">>(null);
  const size = useSize(containerRef);
  const containerWidth = size?.width;
  const containerHeight = size?.height;
  const emptyTooltipData: BasicTooltipData = {
    show: false,
    price: "-",
    position: {
      x: null,
      y: null,
    },
  };
  const [tooltipData, setTooltipData] = useState<BasicTooltipData>(emptyTooltipData);

  const onCrosshairMove: MouseEventHandler<Time> = useCallback(
    param => {
      if (!seriesRef.current || !containerWidth || !containerHeight) {
        return;
      }

      if (!getShowTooltip(param)) {
        setTooltipData(emptyTooltipData);
        return;
      }

      const seriesApi = seriesRef.current.api();

      if (!seriesApi) {
        setTooltipData(emptyTooltipData);
        return;
      }

      const data = param.seriesData.get(seriesApi) as LineData | undefined;

      if (!data) {
        setTooltipData(emptyTooltipData);
        return;
      }

      const price = data.value !== undefined ? data.value.toFixed(2) : "-";
      const time = param.time as string;

      setTooltipData(prev =>
        prev.time !== time
          ? {
              show: true,
              price,
              time,
              position: getTooltipPosition(
                param,
                containerWidth,
                containerHeight,
                options
              ),
            }
          : prev
      );
    },
    [containerWidth, containerHeight, options]
  );

  return {
    onCrosshairMove,
    tooltipData,
    seriesRef,
  };
};

const useMultipleSeriesTooltip = (
  containerRef: RefObject<HTMLElement | null>,
  seriesRefs: Array<RefObject<SeriesApiRef<"Line"> | null>>,
  options: Options
) => {
  const size = useSize(containerRef);
  const containerWidth = size?.width;
  const containerHeight = size?.height;
  const emptyTooltipData: MultipleSeriesTooltipData = {
    show: false,
    data: null,
    position: {
      x: null,
      y: null,
    },
  };
  const [tooltipData, setTooltipData] =
    useState<MultipleSeriesTooltipData>(emptyTooltipData);

  const onCrosshairMove: MouseEventHandler<Time> = useCallback(
    param => {
      if (!containerWidth || !containerHeight) {
        return;
      }

      const showTooltip =
        param.time !== undefined &&
        param.point !== undefined &&
        param.point?.x > 0 &&
        param.point?.y > 0;

      if (!showTooltip) {
        setTooltipData(emptyTooltipData);
        return;
      }

      const data = new Map<number, string>();
      seriesRefs.forEach((ref, index) => {
        const seriesApi = ref.current?.api();
        if (seriesApi) {
          const seriesData = param.seriesData.get(seriesApi) as LineData | undefined;
          if (seriesData && seriesData.value !== undefined) {
            data.set(
              index,
              seriesData.value !== undefined ? seriesData.value.toFixed(2) : "-"
            );
          }
        }
      });

      const time = param.time as string;

      setTooltipData(prev =>
        prev.time !== time
          ? {
              show: true,
              data,
              time,
              position: getTooltipPosition(
                param,
                containerWidth,
                containerHeight,
                options
              ),
            }
          : prev
      );
    },
    [containerWidth, containerHeight, options]
  );

  return {
    onCrosshairMove,
    tooltipData,
  };
};

export { useBasicTooltip, useMultipleSeriesTooltip };
