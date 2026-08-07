import { afterEach, describe, expect, it, vi } from "vitest";
import { version } from "../version";
import { docsBaseUrl } from "./docsBaseUrl";
import { BaseInternalError } from "./InternalError";

describe("BaseInternalError", () => {
  afterEach(() => {
    vi.doUnmock("../version");
    vi.resetModules();
  });

  it("should create an error with a default message", () => {
    const error = new BaseInternalError();
    expect(error.message).toContain("An error occurred");
    expect(error.message).toContain(
      `Version: lightweight-charts-react-components@${version}`
    );
    expect(error.name).toBe("BaseInternalError");
    expect(error.isOperational).toBe(true);
    expect(error.message).not.toContain("Docs:");
  });

  it("should create an error with a custom message", () => {
    const customMessage = "Custom error message";
    const error = new BaseInternalError(customMessage);
    expect(error.message).toContain(customMessage);
    expect(error.name).toBe("BaseInternalError");
    expect(error.message).not.toContain("Docs:");
  });

  it("should handle cause correctly", () => {
    const cause = new Error("Original error");
    const error = new BaseInternalError("Wrapped error", { cause });
    expect(error.cause).toBe(cause);
    expect(error.message).toContain("Wrapped error");
    expect(error.message).toContain(
      `Version: lightweight-charts-react-components@${version}`
    );
  });

  it("handles operational errors", () => {
    const error = new BaseInternalError("Operational error", { isOperational: true });
    expect(error.isOperational).toBe(true);
  });

  it("handles non-operational errors", () => {
    const error = new BaseInternalError("Programmer error", { isOperational: false });
    expect(error.isOperational).toBe(false);
  });

  it("should include documentation path in the message", () => {
    const docsPath = "/errors/internal-error";
    const error = new BaseInternalError("Error with docs", { docsPath });
    expect(error.message).toContain(`Docs: see ${docsBaseUrl}${docsPath}`);
    expect(error.message).toContain(
      `Version: lightweight-charts-react-components@${version}`
    );
  });

  it("omits version details when the version is unavailable", async () => {
    vi.doMock("../version", () => ({ version: "" }));

    const { BaseInternalError: BaseInternalErrorWithoutVersion } = await import(
      "./InternalError"
    );

    const error = new BaseInternalErrorWithoutVersion("Error without version");

    expect(error.message).toContain("Error without version");
    expect(error.message).not.toContain("Version:");
  });
});
