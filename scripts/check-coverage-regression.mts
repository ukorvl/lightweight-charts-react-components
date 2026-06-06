#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

type CoverageMetricKey = "lines" | "statements" | "functions" | "branches";

type CoverageMetric = {
  pct: number;
};

type CoverageSummary = {
  total: Record<CoverageMetricKey, CoverageMetric>;
};

const metricKeys: CoverageMetricKey[] = [
  "lines",
  "statements",
  "functions",
  "branches",
];

const [, , currentArg, baseArg] = process.argv;

const currentPath = path.resolve(
  currentArg ?? "lib/coverage/coverage-summary.json"
);
const basePath = path.resolve(baseArg ?? "lib/coverage-base/coverage-summary.json");

const readSummary = (filePath: string): CoverageSummary => {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as CoverageSummary;
};

const currentSummary = readSummary(currentPath);
const baseSummary = readSummary(basePath);

const regressions = metricKeys.flatMap(metric => {
  const currentPct = currentSummary.total[metric].pct;
  const basePct = baseSummary.total[metric].pct;

  if (currentPct < basePct) {
    return [
      `${metric}: current ${currentPct.toFixed(2)}% < base ${basePct.toFixed(2)}%`,
    ];
  }

  return [];
});

if (regressions.length > 0) {
  process.stderr.write("Coverage regression detected:\n");
  regressions.forEach(regression => {
    process.stderr.write(`- ${regression}\n`);
  });
  process.exit(1);
}

process.stdout.write("Coverage regression check passed.\n");
