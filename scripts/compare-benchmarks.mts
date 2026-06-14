#!/usr/bin/env node
/**
 * Compares Vitest benchmark JSON outputs for a base revision and current revision, writes
 * a markdown summary report, and exits non-zero when a meaningful regression is detected.
 */

import fs from "node:fs";
import path from "node:path";
import { getErrorMessage, readJsonFile } from "./common.mts";

type BenchmarkJson = {
  files: BenchmarkFile[];
};

type BenchmarkFile = {
  filepath: string;
  groups: BenchmarkGroup[];
};

type BenchmarkGroup = {
  fullName: string;
  benchmarks: BenchmarkEntry[];
};

type BenchmarkEntry = {
  name: string;
  mean: number;
  median: number;
  sd: number;
};

type BenchmarkSample = {
  groupLabel: string;
  name: string;
  key: string;
  mean: number;
  median: number;
  sd: number;
};

type AggregatedBenchmark = {
  key: string;
  groupLabel: string;
  name: string;
  medians: number[];
  aggregatedMedian: number;
  cv: number;
  runCount: number;
  expectedRuns: number;
};

type RowStatus = "pass" | "regression" | "unstable" | "new" | "missing" | "incomplete";

type ComparisonRow = {
  name: string;
  base: AggregatedBenchmark | null;
  current: AggregatedBenchmark | null;
  baseMedian: number | null;
  currentMedian: number | null;
  relativeDelta: number | null;
  absoluteDelta: number | null;
  status: RowStatus;
  statusLabel: string;
  fail: boolean;
  sortWeight: number;
};

type ParsedArgs = {
  base: string;
  current: string;
  threshold: number;
  minAbsoluteMs: number;
  maxCv: number;
  output: string;
  baseLabel: string;
  currentLabel: string;
};

const usage = `Usage:
node scripts/compare-benchmarks.mts \
  --base <path> \
  --current <path> \
  --threshold <number> \
  --min-absolute-ms <number> \
  --max-cv <number> \
  --output <path> \
  [--base-label <label>] \
  [--current-label <label>]`;

const parseArgs = (argv: string[]): ParsedArgs => {
  const values = new Map<string, string>();

  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];

    if (!flag?.startsWith("--") || !value) {
      throw new Error(usage);
    }

    values.set(flag.slice(2), value);
  }

  const base = values.get("base");
  const current = values.get("current");
  const threshold = Number(values.get("threshold"));
  const minAbsoluteMs = Number(values.get("min-absolute-ms"));
  const maxCv = Number(values.get("max-cv"));
  const output = values.get("output");

  if (!base || !current || !output) {
    throw new Error(usage);
  }

  if (Number.isNaN(threshold) || Number.isNaN(minAbsoluteMs) || Number.isNaN(maxCv)) {
    throw new Error("Benchmark comparison thresholds must be valid numbers.");
  }

  return {
    base,
    current,
    threshold,
    minAbsoluteMs,
    maxCv,
    output,
    baseLabel: values.get("base-label") ?? "base",
    currentLabel: values.get("current-label") ?? "current",
  };
};

const median = (values: number[]) => {
  const sorted = [...values].sort((left, right) => left - right);

  if (sorted.length === 0) {
    return Number.NaN;
  }

  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
};

const mean = (values: number[]) =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

const standardDeviation = (values: number[]) => {
  if (values.length <= 1) {
    return 0;
  }

  const average = mean(values);
  const variance =
    values.reduce((sum, value) => sum + (value - average) ** 2, 0) / (values.length - 1);

  return Math.sqrt(variance);
};

const coefficientOfVariation = (values: number[]) => {
  if (values.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

  const average = mean(values);
  if (average === 0) {
    return values.every(value => value === 0) ? 0 : Number.POSITIVE_INFINITY;
  }

  return standardDeviation(values) / average;
};

const coefficientOfVariationFromEntry = (entry: BenchmarkEntry) => {
  if (entry.mean === 0) {
    return entry.sd === 0 ? 0 : Number.POSITIVE_INFINITY;
  }

  return entry.sd / entry.mean;
};

const resolveInputFiles = (inputPath: string) => {
  const resolvedPath = path.resolve(inputPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Benchmark input does not exist: ${resolvedPath}`);
  }

  const stats = fs.statSync(resolvedPath);
  if (stats.isDirectory()) {
    const files = fs
      .readdirSync(resolvedPath, { withFileTypes: true })
      .filter(entry => entry.isFile() && entry.name.endsWith(".json"))
      .map(entry => path.join(resolvedPath, entry.name))
      .sort((left, right) => left.localeCompare(right));

    if (files.length === 0) {
      throw new Error(`Benchmark input directory is empty: ${resolvedPath}`);
    }

    return files;
  }

  return [resolvedPath];
};

const normalizeGroupLabel = (fullName: string) => {
  const segments = fullName.split(" > ");
  if (segments.length <= 1) {
    return fullName.trim();
  }

  return segments.slice(1).join(" > ").trim();
};

const readBenchmarkFile = (filePath: string) => {
  const data = readJsonFile<BenchmarkJson>(filePath);
  const benchmarks = new Map<string, BenchmarkSample>();

  for (const file of data.files ?? []) {
    for (const group of file.groups ?? []) {
      const groupLabel = normalizeGroupLabel(group.fullName);

      for (const benchmark of group.benchmarks ?? []) {
        const key = `${groupLabel}::${benchmark.name}`;
        if (benchmarks.has(key)) {
          throw new Error(
            `Duplicate benchmark "${key}" found in ${filePath}. Benchmark names must be unique within a group.`
          );
        }

        benchmarks.set(key, {
          key,
          groupLabel,
          name: benchmark.name,
          mean: benchmark.mean,
          median: benchmark.median,
          sd: benchmark.sd,
        });
      }
    }
  }

  return benchmarks;
};

const aggregateBenchmarks = (inputPath: string) => {
  const files = resolveInputFiles(inputPath);
  const runs = files.map(readBenchmarkFile);
  const keys = new Set(runs.flatMap(run => [...run.keys()]));
  const aggregated = new Map<string, AggregatedBenchmark>();

  for (const key of keys) {
    const samples = runs.flatMap(run => {
      const sample = run.get(key);
      return sample ? [sample] : [];
    });

    if (samples.length === 0) {
      continue;
    }

    const medians = samples.map(sample => sample.median);
    const fallbackCv = coefficientOfVariationFromEntry(samples[0]);
    const cv = medians.length > 1 ? coefficientOfVariation(medians) : fallbackCv;

    aggregated.set(key, {
      key,
      groupLabel: samples[0].groupLabel,
      name: samples[0].name,
      medians,
      aggregatedMedian: median(medians),
      cv,
      runCount: samples.length,
      expectedRuns: files.length,
    });
  }

  return aggregated;
};

const formatMs = (value: number | null) => {
  if (value === null || Number.isNaN(value)) {
    return "-";
  }

  return `${value.toFixed(value < 10 ? 3 : 2)}ms`;
};

const formatPercent = (value: number | null) => {
  if (value === null || !Number.isFinite(value)) {
    return "n/a";
  }

  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
};

const formatSignedMs = (value: number | null) => {
  if (value === null || Number.isNaN(value)) {
    return "n/a";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(value < 10 ? 3 : 2)}ms`;
};

const formatCv = (value: number | null) => {
  if (value === null || !Number.isFinite(value)) {
    return "n/a";
  }

  return `${(value * 100).toFixed(1)}%`;
};

const formatDelta = (relativeDelta: number | null, absoluteDelta: number | null) => {
  const formattedRelative = formatPercent(relativeDelta);
  const formattedAbsolute = formatSignedMs(absoluteDelta);

  if (formattedRelative === "n/a") {
    return "n/a";
  }

  return `${formattedRelative} (${formattedAbsolute})`;
};

const createRows = (
  baseBenchmarks: Map<string, AggregatedBenchmark>,
  currentBenchmarks: Map<string, AggregatedBenchmark>,
  threshold: number,
  minAbsoluteMs: number,
  maxCv: number
) => {
  const keys = new Set([...baseBenchmarks.keys(), ...currentBenchmarks.keys()]);
  const rows: ComparisonRow[] = [];
  const displayNameCounts = new Map<string, number>();

  for (const key of keys) {
    const benchmark = currentBenchmarks.get(key) ?? baseBenchmarks.get(key);
    if (!benchmark) {
      continue;
    }

    displayNameCounts.set(
      benchmark.name,
      (displayNameCounts.get(benchmark.name) ?? 0) + 1
    );
  }

  for (const key of keys) {
    const base = baseBenchmarks.get(key) ?? null;
    const current = currentBenchmarks.get(key) ?? null;
    const benchmark = current ?? base;

    if (!benchmark) {
      continue;
    }

    const name =
      (displayNameCounts.get(benchmark.name) ?? 0) > 1
        ? `${benchmark.groupLabel} / ${benchmark.name}`
        : benchmark.name;

    const baseMedian = base?.aggregatedMedian ?? null;
    const currentMedian = current?.aggregatedMedian ?? null;
    const relativeDelta =
      baseMedian === null || currentMedian === null
        ? null
        : baseMedian === 0
          ? currentMedian === 0
            ? 0
            : Number.POSITIVE_INFINITY
          : currentMedian / baseMedian - 1;
    const absoluteDelta =
      baseMedian === null || currentMedian === null ? null : currentMedian - baseMedian;

    if (!base && current) {
      rows.push({
        name,
        base,
        current,
        baseMedian,
        currentMedian,
        relativeDelta,
        absoluteDelta,
        status: "new",
        statusLabel: "NEW",
        fail: false,
        sortWeight: 20,
      });
      continue;
    }

    if (base && !current) {
      rows.push({
        name,
        base,
        current,
        baseMedian,
        currentMedian,
        relativeDelta,
        absoluteDelta,
        status: "missing",
        statusLabel: "FAIL missing in current",
        fail: true,
        sortWeight: 0,
      });
      continue;
    }

    if (!base || !current) {
      continue;
    }

    const incomplete =
      base.runCount !== base.expectedRuns || current.runCount !== current.expectedRuns;

    if (incomplete) {
      rows.push({
        name,
        base,
        current,
        baseMedian,
        currentMedian,
        relativeDelta,
        absoluteDelta,
        status: "incomplete",
        statusLabel: `FAIL incomplete (${base.runCount}/${base.expectedRuns} base, ${current.runCount}/${current.expectedRuns} current)`,
        fail: true,
        sortWeight: 1,
      });
      continue;
    }

    const unstable = base.cv > maxCv || current.cv > maxCv;
    if (unstable) {
      rows.push({
        name,
        base,
        current,
        baseMedian,
        currentMedian,
        relativeDelta,
        absoluteDelta,
        status: "unstable",
        statusLabel: "UNSTABLE noisy benchmark",
        fail: false,
        sortWeight: 10,
      });
      continue;
    }

    const isRegression =
      (relativeDelta ?? 0) > threshold && (absoluteDelta ?? 0) > minAbsoluteMs;

    rows.push({
      name,
      base,
      current,
      baseMedian,
      currentMedian,
      relativeDelta,
      absoluteDelta,
      status: isRegression ? "regression" : "pass",
      statusLabel: isRegression ? "FAIL regression" : "PASS",
      fail: isRegression,
      sortWeight: isRegression ? 2 : 30,
    });
  }

  return rows.sort((left, right) => {
    if (left.sortWeight !== right.sortWeight) {
      return left.sortWeight - right.sortWeight;
    }

    const leftDelta = left.relativeDelta ?? Number.NEGATIVE_INFINITY;
    const rightDelta = right.relativeDelta ?? Number.NEGATIVE_INFINITY;
    if (leftDelta !== rightDelta) {
      return rightDelta - leftDelta;
    }

    return left.name.localeCompare(right.name);
  });
};

const buildMarkdownReport = (
  rows: ComparisonRow[],
  options: ParsedArgs,
  baseRuns: number,
  currentRuns: number
) => {
  const regressionCount = rows.filter(row => row.status === "regression").length;
  const unstableCount = rows.filter(row => row.status === "unstable").length;
  const newCount = rows.filter(row => row.status === "new").length;
  const missingCount = rows.filter(row => row.status === "missing").length;
  const incompleteCount = rows.filter(row => row.status === "incomplete").length;
  const stableComparedCount = rows.filter(
    row => row.status === "pass" || row.status === "regression"
  ).length;
  const failed = rows.some(row => row.fail);

  const lines = [
    "## Benchmark Comparison",
    "",
    `Base: \`${options.baseLabel}\``,
    `Current: \`${options.currentLabel}\``,
    "",
    `Result: ${failed ? "FAIL" : "PASS"}`,
    `Compared ${rows.length} benchmark entries; ${stableComparedCount} stable comparisons participated in the blocking gate.`,
    "",
    "| Benchmark | Base | Current | Delta | Base CV | Current CV | Status |",
    "|---|---:|---:|---:|---:|---:|---|",
    ...rows.map(row => {
      const baseCv = row.base ? formatCv(row.base.cv) : "-";
      const currentCv = row.current ? formatCv(row.current.cv) : "-";

      return `| ${row.name} | ${formatMs(row.baseMedian)} | ${formatMs(row.currentMedian)} | ${formatDelta(row.relativeDelta, row.absoluteDelta)} | ${baseCv} | ${currentCv} | ${row.statusLabel} |`;
    }),
    "",
    "Thresholds:",
    `- relative regression: ${(options.threshold * 100).toFixed(1)}%`,
    `- minimum absolute slowdown: ${options.minAbsoluteMs.toFixed(2)}ms`,
    `- max allowed CV: ${(options.maxCv * 100).toFixed(1)}%`,
    `- base benchmark runs: ${baseRuns}`,
    `- current benchmark runs: ${currentRuns}`,
    "",
    "Notes:",
    "- CI fails only when a stable benchmark exceeds both the relative and absolute slowdown thresholds.",
    "- Benchmarks above the CV threshold are marked UNSTABLE and excluded from the blocking gate.",
    "- When multiple JSON files are provided, medians and CVs are calculated from repeated benchmark runs.",
  ];

  if (regressionCount > 0 || missingCount > 0 || incompleteCount > 0) {
    lines.push("");
    lines.push("Failures:");
    if (regressionCount > 0) {
      lines.push(`- regressions: ${regressionCount}`);
    }
    if (missingCount > 0) {
      lines.push(`- missing benchmarks in current: ${missingCount}`);
    }
    if (incompleteCount > 0) {
      lines.push(`- incomplete benchmark datasets: ${incompleteCount}`);
    }
  }

  if (unstableCount > 0 || newCount > 0) {
    lines.push("");
    lines.push("Additional signals:");
    if (unstableCount > 0) {
      lines.push(`- unstable benchmarks excluded from the gate: ${unstableCount}`);
    }
    if (newCount > 0) {
      lines.push(`- new benchmarks without a base comparison: ${newCount}`);
    }
  }

  if (stableComparedCount === 0) {
    lines.push("");
    lines.push(
      "Warning: no stable benchmark comparisons were available for the blocking gate."
    );
  }

  return `${lines.join("\n")}\n`;
};

try {
  const options = parseArgs(process.argv.slice(2));
  const baseBenchmarks = aggregateBenchmarks(options.base);
  const currentBenchmarks = aggregateBenchmarks(options.current);
  const rows = createRows(
    baseBenchmarks,
    currentBenchmarks,
    options.threshold,
    options.minAbsoluteMs,
    options.maxCv
  );
  const baseRuns =
    baseBenchmarks.values().next().value?.expectedRuns ??
    resolveInputFiles(options.base).length;
  const currentRuns =
    currentBenchmarks.values().next().value?.expectedRuns ??
    resolveInputFiles(options.current).length;
  const report = buildMarkdownReport(rows, options, baseRuns, currentRuns);
  const outputPath = path.resolve(options.output);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, report);
  process.stdout.write(`Benchmark report written to ${outputPath}\n`);

  if (rows.some(row => row.fail)) {
    process.exit(1);
  }
} catch (error) {
  process.stderr.write(`${getErrorMessage(error)}\n`);
  process.exit(1);
}
