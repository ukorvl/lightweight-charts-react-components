import { renderHook } from "@testing-library/react";
import { createContext } from "react";
import React from "react";
import { describe, expect, it } from "vitest";
import { BaseInternalError } from "./InternalError";
import { useSafeContext } from "./useSafeContext";
import type { PropsWithChildren } from "react";

const captureHookError = (callback: () => void) => {
  try {
    callback();
  } catch (error) {
    return error as BaseInternalError;
  }

  throw new Error("Expected renderHook to throw");
};

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

    const error = captureHookError(() => {
      renderHook(() => useSafeContext(TestContext));
    });

    expect(error).toBeInstanceOf(BaseInternalError);
    expect(error.isOperational).toBe(true);
    expect(error.message).toContain("not found");
    expect(error.message).toContain("TestContext");
  });

  it("throws BaseInternalError with custom error message", () => {
    const TestContext = createContext<string | undefined>(undefined);

    const error = captureHookError(() => {
      renderHook(() => useSafeContext(TestContext, "Custom error message"));
    });

    expect(error).toBeInstanceOf(BaseInternalError);
    expect(error.isOperational).toBe(true);
    expect(error.message).toContain("Custom error message");
  });

  it("falls back to a generic context name when displayName is missing", () => {
    const TestContext = createContext<string | undefined>(undefined);

    const error = captureHookError(() => {
      renderHook(() => useSafeContext(TestContext));
    });

    expect(error.message).toContain("Context not found.");
  });
});
