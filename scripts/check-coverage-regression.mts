#!/usr/bin/env node

import path from "node:path";
import { getErrorMessage, isMainModule, readJsonFile } from "./common.mts";

export type CoverageMetricKey = "lines" | "statements" | "functions" | "branches";

export type CoverageMetric = {
  pct: number;
};

export type CoverageSummary = {
  total: Record<CoverageMetricKey, CoverageMetric>;
};

const writeStdout = (message: string) => {
  process.stdout.write(`${message}\n`);
};

const writeStderr = (message: string) => {
  process.stderr.write(`${message}\n`);
};

const metricKeys: CoverageMetricKey[] = ["lines", "statements", "functions", "branches"];

export const findCoverageRegressions = (
  currentSummary: CoverageSummary,
  baseSummary: CoverageSummary
) =>
  metricKeys.flatMap(metric => {
    const currentPct = currentSummary.total[metric].pct;
    const basePct = baseSummary.total[metric].pct;

    if (currentPct < basePct) {
      return [
        `${metric}: current ${currentPct.toFixed(2)}% < base ${basePct.toFixed(2)}%`,
      ];
    }

    return [];
  });

export const run = (
  currentArg = "lib/coverage/coverage-summary.json",
  baseArg = "lib/coverage-base/coverage-summary.json"
) => {
  const currentPath = path.resolve(currentArg);
  const basePath = path.resolve(baseArg);
  const currentSummary = readJsonFile<CoverageSummary>(currentPath);
  const baseSummary = readJsonFile<CoverageSummary>(basePath);

  return findCoverageRegressions(currentSummary, baseSummary);
};

if (isMainModule(import.meta.url)) {
  try {
    const regressions = run(process.argv[2], process.argv[3]);

    if (regressions.length > 0) {
      writeStderr("Coverage regression detected:");
      regressions.forEach(regression => {
        writeStderr(`- ${regression}`);
      });
      process.exit(1);
    }

    writeStdout("Coverage regression check passed.");
  } catch (error) {
    writeStderr(getErrorMessage(error));
    process.exit(1);
  }
}
