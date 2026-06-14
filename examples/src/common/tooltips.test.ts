import { describe, expect, it } from "vitest";
import { getTooltipPosition } from "@/common/tooltips";
import type { MouseEventParams } from "lightweight-charts";

const createMouseEventParams = (x: number, y: number) =>
  ({
    point: {
      x,
      y,
    },
  }) as MouseEventParams;

describe("getTooltipPosition", () => {
  it("anchors the tooltip near the cursor when there is enough space", () => {
    const position = getTooltipPosition(
      createMouseEventParams(120, 80),
      400,
      300,
      "anchor",
      {
        tooltipWidth: 80,
        tooltipHeight: 40,
      }
    );

    expect(position).toEqual({
      x: 130,
      y: 90,
    });
  });

  it("flips anchored tooltips back into the viewport on right and bottom overflow", () => {
    const position = getTooltipPosition(
      createMouseEventParams(190, 95),
      200,
      100,
      "anchor",
      {
        tooltipWidth: 60,
        tooltipHeight: 30,
        xOffset: 5,
        yOffset: 5,
      }
    );

    expect(position).toEqual({
      x: 125,
      y: 60,
    });
  });

  it("keeps centered tooltips inside the top-left bounds", () => {
    const position = getTooltipPosition(
      createMouseEventParams(10, 10),
      200,
      100,
      "center",
      {
        tooltipWidth: 80,
        tooltipHeight: 40,
        xOffset: 6,
        yOffset: 8,
      }
    );

    expect(position).toEqual({
      x: 6,
      y: 8,
    });
  });
});
