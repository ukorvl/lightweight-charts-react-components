import type { MouseEventParams } from "lightweight-charts";

type Positioning = "center" | "anchor";

type TooltipOptions = {
  tooltipWidth: number;
  tooltipHeight: number;
  yOffset?: number;
  xOffset?: number;
};

const getTooltipPosition = (
  param: MouseEventParams,
  containerWidth: number,
  containerHeight: number,
  positioning: Positioning,
  o: TooltipOptions
) => {
  const { tooltipHeight, tooltipWidth, yOffset = 10, xOffset = 10 } = o;
  // const x = param.point!.x + xOffset;
  // const y = param.point!.y + yOffset;
  // const xOverflow = x > containerWidth - tooltipWidth;
  // const yOverflow = y > containerHeight - tooltipHeight;

  // return {
  //   x: xOverflow ? x - tooltipWidth - xOffset * 2 : x,
  //   y: yOverflow ? y - tooltipHeight - yOffset * 2 : y,
  // };
  const baseX = param.point!.x;
  const baseY = param.point!.y;

  let x: number;
  let y: number;

  switch (positioning) {
    case "center":
      x = baseX - tooltipWidth / 2;
      y = baseY - tooltipHeight / 2;
      break;
    case "anchor":
    default:
      x = baseX + xOffset;
      y = baseY + yOffset;
      break;
  }

  if (x + tooltipWidth > containerWidth) {
    x =
      positioning === "center"
        ? containerWidth - tooltipWidth - xOffset
        : x - tooltipWidth - xOffset * 2;
  }

  if (y + tooltipHeight > containerHeight) {
    y =
      positioning === "center"
        ? containerHeight - tooltipHeight - yOffset
        : y - tooltipHeight - yOffset * 2;
  }

  // Prevent overflow on left/top
  if (x < 0) x = xOffset;
  if (y < 0) y = yOffset;

  return { x, y };
};

export { getTooltipPosition, type TooltipOptions };
