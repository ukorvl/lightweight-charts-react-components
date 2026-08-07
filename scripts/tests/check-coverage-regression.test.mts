import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  findCoverageRegressions,
  run,
  type CoverageSummary,
} from "../check-coverage-regression.mts";
import { createTempDir, writeJsonFile } from "./test-helpers.mts";

const createCoverageSummary = (
  coverage: Partial<Record<string, number>>
): CoverageSummary => ({
  total: {
    lines: { pct: coverage.lines ?? 100 },
    statements: { pct: coverage.statements ?? 100 },
    functions: { pct: coverage.functions ?? 100 },
    branches: { pct: coverage.branches ?? 100 },
  },
});

describe("check-coverage-regression", () => {
  it("lists every metric that regressed compared with the base summary", () => {
    const currentSummary = createCoverageSummary({
      lines: 99,
      statements: 98,
      functions: 97,
      branches: 96,
    });
    const baseSummary = createCoverageSummary({
      lines: 100,
      statements: 97,
      functions: 98,
      branches: 96,
    });

    expect(findCoverageRegressions(currentSummary, baseSummary)).toEqual([
      "lines: current 99.00% < base 100.00%",
      "functions: current 97.00% < base 98.00%",
    ]);
  });

  it("reads the current and base coverage summaries from disk", () => {
    const tempDir = createTempDir();
    const currentPath = path.join(tempDir, "coverage-summary.json");
    const basePath = path.join(tempDir, "coverage-base-summary.json");

    writeJsonFile(currentPath, createCoverageSummary({ lines: 98, branches: 95 }));
    writeJsonFile(basePath, createCoverageSummary({ lines: 98, branches: 94 }));

    expect(run(currentPath, basePath)).toEqual([]);
  });
});
