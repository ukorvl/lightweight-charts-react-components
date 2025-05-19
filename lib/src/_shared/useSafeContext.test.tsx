import { renderHook } from "@testing-library/react";
import { createContext } from "react";
import { describe, expect, it } from "vitest";
import { BaseInternalError } from "./InternalError";
import { useSafeContext } from "./useSafeContext";
import type { PropsWithChildren } from "react";

describe("useSafeContext", () => {
  it("returns the context value when context is available", () => {
    const TestContext = createContext<string | undefined>(undefined);

    const wrapper = ({ children }: PropsWithChildren) => (
      <TestContext.Provider value="hello">{children}</TestContext.Provider>
    );

    const { result } = renderHook(() => useSafeContext(TestContext), { wrapper });

    expect(result.current).toBe("hello");
  });

  it("throws BaseInternalError if context is undefined", () => {
    const TestContext = createContext<string | undefined>(undefined);
    TestContext.displayName = "TestContext";

    try {
      renderHook(() => useSafeContext(TestContext));
    } catch (error) {
      expect(error).toBeInstanceOf(BaseInternalError);
      expect((error as BaseInternalError).message).toContain("not found");
      expect((error as BaseInternalError).message).toContain("TestContext");
    }
  });

  it("throws BaseInternalError with custom error message", () => {
    const TestContext = createContext<string | undefined>(undefined);

    try {
      renderHook(() => useSafeContext(TestContext, "Custom error message"));
    } catch (error) {
      expect(error).toBeInstanceOf(BaseInternalError);
      expect((error as BaseInternalError).message).toContain("Custom error message");
    }
  });
});
