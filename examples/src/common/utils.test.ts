import { describe, expect, it } from "vitest";
import { colors } from "@/common/colors";
import { deepMergePlainObjects, getContrastingTextColor } from "@/common/utils";

describe("deepMergePlainObjects", () => {
  it("merges nested plain objects without mutating the target", () => {
    const target = {
      layout: {
        textColor: colors.blue,
        background: {
          color: "transparent",
        },
      },
      rightPriceScale: {
        visible: true,
      },
    };

    const source = {
      layout: {
        background: {
          color: colors.black,
        },
      },
      localization: {
        locale: "en-US",
      },
    };

    const merged = deepMergePlainObjects(target, source);

    expect(merged).toEqual({
      layout: {
        textColor: colors.blue,
        background: {
          color: colors.black,
        },
      },
      rightPriceScale: {
        visible: true,
      },
      localization: {
        locale: "en-US",
      },
    });
    expect(target).toEqual({
      layout: {
        textColor: colors.blue,
        background: {
          color: "transparent",
        },
      },
      rightPriceScale: {
        visible: true,
      },
    });
  });

  it("throws when either argument is not a plain object", () => {
    expect(() =>
      deepMergePlainObjects([] as unknown as Record<string, unknown>, {
        key: "value",
      })
    ).toThrow("Target must be a plain object");

    expect(() =>
      deepMergePlainObjects(
        {
          key: "value",
        },
        null as unknown as Record<string, unknown>
      )
    ).toThrow("Source must be a plain object");
  });
});

describe("getContrastingTextColor", () => {
  it("returns dark text for bright backgrounds and light text for dark backgrounds", () => {
    expect(getContrastingTextColor("#ffffff")).toBe(colors.black);
    expect(getContrastingTextColor("#101935")).toBe(colors.white);
  });
});
