#!/usr/bin/env node
/* eslint-disable no-console */

// Converts Vitest benchmark output to github-action-benchmark compatible format
// Usage: node convert-benchmark.mts [inputFile] [outputFile] (use relative to the root directory)

import { readFileSync, writeFileSync } from "fs";
import path from "path";

const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const rootDir = path.join(scriptDir, "..");

const defaultInputFile = path.join(
  "lib",
  "tests",
  "bench",
  "output",
  "benchmark-results.json"
);
const defaultOutputFile = path.join(
  "lib",
  "tests",
  "bench",
  "output",
  "github-action-benchmark-results.json"
);

function convertVitestToGithubActionBenchmark(vitestData) {
  const converted = [];

  vitestData.files.forEach(file => {
    file.groups.forEach(group => {
      group.benchmarks.forEach(benchmark => {
        // Convert Vitest benchmark to github-action-benchmark format
        const convertedBenchmark = {
          name: benchmark.name,
          unit: "ops/sec", // Operations per second (Hz)
          value: benchmark.hz, // Use Hz (operations per second) as the main metric

          // Additional metrics that github-action-benchmark can use
          extra: {
            // Time-based metrics (in milliseconds)
            mean: benchmark.mean,
            min: benchmark.min,
            max: benchmark.max,
            median: benchmark.median,

            // Statistical metrics
            standardDeviation: benchmark.sd,
            marginOfError: benchmark.moe,
            relativeMarginOfError: benchmark.rme,

            // Percentiles
            p75: benchmark.p75,
            p99: benchmark.p99,
            p995: benchmark.p995,
            p999: benchmark.p999,

            // Sample information
            samples: benchmark.sampleCount,
            totalTime: benchmark.totalTime,

            // Ranking information
            rank: benchmark.rank,

            // Source information
            group: group.fullName,
            file: file.filepath,
          },
        };

        converted.push(convertedBenchmark);
      });
    });
  });

  return converted;
}

const main = async () => {
  const args = process.argv.slice(2);
  const [inputFile, outputFile] = args;

  const inputFilePath = path.resolve(rootDir, inputFile || defaultInputFile);
  const outputFilePath = path.resolve(rootDir, outputFile || defaultOutputFile);

  try {
    const inputData = JSON.parse(readFileSync(inputFilePath, "utf8"));
    const convertedData = convertVitestToGithubActionBenchmark(inputData);

    writeFileSync(outputFilePath, JSON.stringify(convertedData, null, 2));

    console.log(`Successfully converted ${inputFilePath} to ${outputFilePath}`);
  } catch (error) {
    console.error("Failed to convert benchmark data:", error.message);
    process.exit(1);
  }
};

main().catch(error => {
  console.error("Error:", error.message);
  process.exit(1);
});
