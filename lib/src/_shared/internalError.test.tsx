import { describe, expect, it } from "vitest";
import { BaseInternalError } from "./InternalError";

describe("BaseInternalError", () => {
  it("should create an error with a default message", () => {
    const error = new BaseInternalError();
    expect(error.message).toContain("An error occurred");
  });

  it("should create an error with a custom message", () => {
    const customMessage = "Custom error message";
    const error = new BaseInternalError(customMessage);
    expect(error.message).toContain(customMessage);
  });

  it("should handle cause correctly", () => {
    const cause = new Error("Original error");
    const error = new BaseInternalError("Wrapped error", { cause });
    expect(error.cause).toBe(cause);
    expect(error.message).toContain("Wrapped error");
  });

  it("handles operational errors", () => {
    const error = new BaseInternalError("Operational error", { isOperational: true });
    expect(error.isOperational).toBe(true);
  });

  it("should include documentation path in the message", () => {
    const docsPath = "/errors/internal-error";
    const error = new BaseInternalError("Error with docs", { docsPath });
    expect(error.message).toContain(
      `Docs: see https://ukorvl.github.io/lightweight-charts-react-components/docs/${docsPath}`
    );
  });
});
