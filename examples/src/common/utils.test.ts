import { describe, expect, it, vi } from "vitest";
import { colors } from "@/common/colors";
import {
  createStubArray,
  deepMergePlainObjects,
  encodeInlineSvg,
  getContrastingTextColor,
  sleep,
  typedObjectEntries,
  typedObjectKeys,
} from "@/common/utils";

describe("typedObjectKeys", () => {
  it("returns the object keys with their original order", () => {
    expect(typedObjectKeys({ first: 1, second: 2 })).toEqual(["first", "second"]);
  });
});

describe("typedObjectEntries", () => {
  it("returns the object entries with keys and values intact", () => {
    expect(typedObjectEntries({ first: 1, second: 2 })).toEqual([
      ["first", 1],
      ["second", 2],
    ]);
  });
});

describe("createStubArray", () => {
  it("creates an array of zeros with the requested length", () => {
    expect(createStubArray(4)).toEqual([0, 0, 0, 0]);
  });
});

describe("encodeInlineSvg", () => {
  it("encodes inline SVG data as a data URI", () => {
    expect(encodeInlineSvg("<svg viewBox='0 0 1 1'></svg>")).toBe(
      "data:image/svg+xml,%3Csvg%20viewBox%3D'0%200%201%201'%3E%3C%2Fsvg%3E"
    );
  });
});

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

  it("ignores inherited source properties during the merge", () => {
    const inheritedSource = Object.create({
      inherited: "skip me",
    }) as Record<string, string>;
    inheritedSource.own = "keep me";

    expect(deepMergePlainObjects({ existing: true }, inheritedSource)).toEqual({
      existing: true,
      own: "keep me",
    });
  });
});

describe("getContrastingTextColor", () => {
  it("returns dark text for bright backgrounds and light text for dark backgrounds", () => {
    expect(getContrastingTextColor("#ffffff")).toBe(colors.black);
    expect(getContrastingTextColor("#101935")).toBe(colors.white);
    expect(getContrastingTextColor("#00ddff")).toBe(colors.black);
    expect(getContrastingTextColor("#ff8200")).toBe(colors.black);
  });

  it("keeps the threshold value on the light-text side", () => {
    expect(getContrastingTextColor("#969696")).toBe(colors.white);
  });

  it("strips only a leading hash from the input", () => {
    expect(getContrastingTextColor("0#eeeee")).toBe(colors.black);
  });
});

describe("sleep", () => {
  it("resolves after the requested timeout", async () => {
    vi.useFakeTimers();

    const onResolved = vi.fn();
    const promise = sleep(25).then(onResolved);

    await vi.advanceTimersByTimeAsync(24);
    expect(onResolved).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    await promise;

    expect(onResolved).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
