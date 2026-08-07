import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { getErrorMessage, getRepoRoot, isMainModule, readJsonFile } from "../common.mts";
import { createTempDir, repoRoot, writeJsonFile } from "./test-helpers.mts";

describe("common script helpers", () => {
  it("resolves the repository root from a scripts module URL", () => {
    expect(getRepoRoot(new URL("../common.mts", import.meta.url).href)).toBe(repoRoot);
  });

  it("reads and parses JSON files", () => {
    const tempDir = createTempDir();
    const filePath = path.join(tempDir, "data.json");

    writeJsonFile(filePath, { version: "2.6.0", valid: true });

    expect(readJsonFile<{ version: string; valid: boolean }>(filePath)).toEqual({
      version: "2.6.0",
      valid: true,
    });
  });

  it("formats unknown errors as readable strings", () => {
    expect(getErrorMessage(new Error("boom"))).toBe("boom");
    expect(getErrorMessage("plain failure")).toBe("plain failure");
  });

  it("detects when a module is the active Node entrypoint", () => {
    const originalArgv1 = process.argv[1];
    const commonFilePath = fileURLToPath(new URL("../common.mts", import.meta.url));

    try {
      process.argv[1] = commonFilePath;
      expect(isMainModule(new URL("../common.mts", import.meta.url).href)).toBe(true);

      process.argv[1] = path.join(repoRoot, "scripts", "not-the-entrypoint.mts");
      expect(isMainModule(new URL("../common.mts", import.meta.url).href)).toBe(false);
    } finally {
      if (originalArgv1 === undefined) {
        delete process.argv[1];
      } else {
        process.argv[1] = originalArgv1;
      }
    }
  });
});
