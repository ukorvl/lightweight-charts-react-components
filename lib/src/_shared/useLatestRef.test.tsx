import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useLatestRef } from "./useLatestRef";

describe("useLatestRef", () => {
  it("should keep the latest value", () => {
    const { result, rerender } = renderHook(({ value }) => useLatestRef(value), {
      initialProps: {
        value: "first",
      },
    });

    const initialRef = result.current;
    expect(initialRef.current).toBe("first");

    rerender({ value: "second" });

    expect(result.current).toBe(initialRef);
    expect(result.current.current).toBe("second");
  });
});
