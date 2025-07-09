import { useCallback, useState } from "react";
import { getTooltipPosition } from "@/common/tooltips";
import { useSize } from "@/common/useSize";
import type { MouseEventHandler, Time } from "lightweight-charts";
import type { RefObject } from "react";

type Position = {
  x: number | null;
  y: number | null;
};

type UseTooltipParams = {
  width: number;
  height: number;
  containerRef: RefObject<HTMLElement | null>;
};

const tooltipOffset = 10;

const useTooltip = ({ width, height, containerRef }: UseTooltipParams) => {
  const size = useSize(containerRef);
  const containerWidth = size?.width;
  const containerHeight = size?.height;
  const [position, setPosition] = useState<Position>({
    x: null,
    y: null,
  });
  const [_show, setShow] = useState<boolean>(false);
  const [time, setTime] = useState<Time | null>(null);
  const close = useCallback(() => {
    setShow(false);
    setPosition({
      x: null,
      y: null,
    });
  }, []);
  const show = _show && time !== null && position.x !== null && position.y !== null;

  const onChartClick: MouseEventHandler<Time> = useCallback(
    param => {
      if (!containerWidth || !containerHeight) {
        return;
      }

      const timeToSet = param.time;
      if (timeToSet === undefined || param.point === undefined) {
        return;
      }

      const tooltipPos = getTooltipPosition(
        param,
        containerWidth,
        containerHeight,
        "center",
        {
          tooltipWidth: width,
          tooltipHeight: height,
          xOffset: tooltipOffset,
          yOffset: tooltipOffset,
        }
      );

      setPosition(tooltipPos);
      setShow(true);
      setTime(timeToSet);
    },
    [containerWidth, containerHeight, width, height]
  );

  return { position, show, close, onChartClick, time };
};

export { useTooltip };
