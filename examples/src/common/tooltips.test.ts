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

  it("keeps centered tooltips at their calculated position when no clamping is needed", () => {
    const position = getTooltipPosition(
      createMouseEventParams(100, 90),
      300,
      200,
      "center",
      {
        tooltipWidth: 80,
        tooltipHeight: 40,
        xOffset: 6,
        yOffset: 8,
      }
    );

    expect(position).toEqual({
      x: 60,
      y: 70,
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

  it("keeps anchored tooltips in place when they exactly touch the right and bottom edges", () => {
    const position = getTooltipPosition(
      createMouseEventParams(120, 50),
      200,
      100,
      "anchor",
      {
        tooltipWidth: 70,
        tooltipHeight: 40,
      }
    );

    expect(position).toEqual({
      x: 130,
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

  it("repositions centered tooltips inside the right and bottom edges", () => {
    const position = getTooltipPosition(
      createMouseEventParams(190, 95),
      200,
      100,
      "center",
      {
        tooltipWidth: 60,
        tooltipHeight: 30,
        xOffset: 5,
        yOffset: 7,
      }
    );

    expect(position).toEqual({
      x: 135,
      y: 63,
    });
  });

  it("does not clamp centered tooltips that land exactly on the top-left origin", () => {
    const position = getTooltipPosition(
      createMouseEventParams(40, 20),
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
      x: 0,
      y: 0,
    });
  });
});
