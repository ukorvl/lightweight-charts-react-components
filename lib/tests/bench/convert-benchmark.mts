#!/usr/bin/env node
/* eslint-disable no-console */

// Converts Vitest benchmark output to github-action-benchmark compatible format

import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { benchmarkOutPutFileName } from "./utils";

const scriptDir = path.dirname(new URL(import.meta.url).pathname);

const defaultInputFile = path.join(scriptDir, "output", benchmarkOutPutFileName);
const defaultOutputFile = path.join(scriptDir, "output", "benchmark-data.json");

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
  const [inputFile = defaultInputFile, outputFile = defaultOutputFile] = args;

  try {
    const inputData = JSON.parse(readFileSync(inputFile, "utf8"));
    const convertedData = convertVitestToGithubActionBenchmark(inputData);

    writeFileSync(outputFile, JSON.stringify(convertedData, null, 2));

    console.log(`Successfully converted ${inputFile} to ${outputFile}`);
  } catch (error) {
    console.error("Failed to convert benchmark data:", error.message);
    process.exit(1);
  }
};

main().catch(error => {
  console.error("Error:", error.message);
  process.exit(1);
});
