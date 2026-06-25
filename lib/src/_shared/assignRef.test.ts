import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { assignRef } from "./assignRef";

describe("assignRef", () => {
  it("does nothing when ref is undefined", () => {
    expect(() => assignRef(undefined, "value")).not.toThrow();
  });

  it("does nothing when ref is null", () => {
    expect(() => assignRef(null, "value")).not.toThrow();
  });

  it("calls a callback ref with the provided value", () => {
    const ref = vi.fn();

    assignRef(ref, "value");

    expect(ref).toHaveBeenCalledWith("value");
  });

  it("assigns the provided value to an object ref", () => {
    const ref = createRef<string>();

    assignRef(ref, "value");

    expect(ref.current).toBe("value");
  });

  it("clears an object ref when null is provided", () => {
    const ref = createRef<string>();

    assignRef(ref, "value");
    assignRef(ref, null);

    expect(ref.current).toBeNull();
  });
});
