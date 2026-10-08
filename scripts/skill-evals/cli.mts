#!/usr/bin/env node
// Skill evaluation CLI. Inputs: command and named options. Outputs: paired
// consumer workspaces, backend receipts, evidence, and an honest pilot report.
import { spawnSync } from "node:child_process";
import { cp, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CommandBackend, parseCommand } from "./backend.mts";
import { calibrate } from "./calibrate.mts";
import {
  digest,
  fileHashes,
  parseReceipt,
  parseSuite,
  readJson,
  safeName,
  writeJson,
} from "./io.mts";
import { iterationPath, prepare, runPath } from "./prepare.mts";
import { report } from "./report.mts";
import { verify } from "./verify.mts";
import type { Arm, Manifest, RunRequest } from "./types.mts";

export function parseArguments(args: string[]) {
  const command = args.shift() ?? "help";
  const options: Record<string, string> = {};
  while (args.length) {
    const key = args.shift();
    const value = args.shift();
    if (
      !key?.startsWith("--") ||
      !value ||
      value.startsWith("--") ||
      key.slice(2) in options
    )
      throw new Error("Expected unique --option value pairs");
    options[key.slice(2)] = value;
  }
  return { command, options };
}
function option(options: Record<string, string>, key: string) {
  const value = options[key];
  if (!value) throw new Error("Missing --" + key);
  return value;
}
async function exists(file: string) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}
export async function main(
  args: string[],
  repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
) {
  const { command, options } = parseArguments([...args]);
  const cache = options.cache
    ? path.resolve(options.cache)
    : path.join(repo, ".cache/skill-evals/npm");
  if (command === "help")
    return "Commands: list, setup, prepare, execute, record, verify, calibrate, report. See scripts/skill-evals/README.md.";
  if (command === "list")
    return parseSuite(
      await readJson(
        path.join(repo, "skills/lightweight-charts-react-components/evals/evals.json")
      )
    );
  if (command === "setup") {
    const fixture = path.join(repo, ".cache/skill-evals/consumer");
    await mkdir(fixture, { recursive: true });
    await cp(path.join(repo, "scripts/skill-evals/fixtures/files/shared"), fixture, {
      recursive: true,
    });
    await mkdir(path.join(fixture, "vendor/library"), { recursive: true });
    await cp(path.join(repo, "lib/dist"), path.join(fixture, "vendor/library/dist"), {
      recursive: true,
    });
    await cp(
      path.join(repo, "lib/package.json"),
      path.join(fixture, "vendor/library/package.json")
    );
    const result = spawnSync(
      "npm",
      [
        "ci",
        "--ignore-scripts",
        "--install-links",
        "--cache",
        cache,
        "--no-audit",
        "--no-fund",
      ],
      { cwd: fixture, encoding: "utf8" }
    );
    if (result.status !== 0)
      throw new Error((result.stdout ?? "") + (result.stderr ?? ""));
    return { cache, installed: true };
  }
  const iteration = iterationPath(repo, option(options, "iteration"));
  if (command === "prepare")
    return prepare(
      repo,
      option(options, "iteration"),
      Number(options.repetitions ?? "1"),
      Number(options["timeout-ms"] ?? "1200000"),
      cache
    );
  if (command === "report") return report(iteration);
  if (command === "calibrate") {
    // Never overwrite an actual pilot with known answers.
    if (!option(options, "iteration").startsWith("calibration-"))
      throw new Error("Use a separate calibration-* iteration");
    const results = await calibrate(repo, iteration);
    await report(iteration);
    if (!results.every(result => result.good && result.defectDetected))
      throw new Error(
        "Calibration failed; inspect calibration.json and per-run evidence"
      );
    return results;
  }
  const arm = option(options, "arm");
  if (arm !== "with_skill" && arm !== "without_skill") throw new Error("Invalid arm");
  const manifest = (await readJson(path.join(iteration, "manifest.json"))) as Manifest;
  const repetition = Number(options.repeat ?? "1");
  const caseName = safeName(option(options, "case"));
  if (
    !manifest.suite.evals.some(item => item.name === caseName) ||
    repetition > manifest.repetitions
  )
    throw new Error("Run is not in the manifest");
  const directory = runPath(iteration, caseName, repetition, arm as Arm);
  if (command === "verify") return verify(repo, iteration, directory);
  if (command === "record") {
    if (await exists(path.join(directory, "receipt.json")))
      throw new Error("Receipt already exists; use a new iteration");
    const receipt = parseReceipt(
      await readJson(path.resolve(option(options, "receipt")))
    );
    await writeJson(path.join(directory, "receipt.json"), receipt);
    await writeJson(path.join(directory, "timing.json"), {
      total_tokens: receipt.totalTokens,
      duration_ms: receipt.durationMs,
    });
    return receipt;
  }
  if (command === "execute") {
    if (
      (await exists(path.join(directory, "started.json"))) ||
      (await exists(path.join(directory, "receipt.json")))
    )
      throw new Error("Run already started; use a new iteration");
    const request = (await readJson(path.join(directory, "request.json"))) as RunRequest;
    const original = await fileHashes(path.join(iteration, ".prepared", caseName, "src"));
    const current = await fileHashes(path.join(request.projectDirectory, "src"));
    if (digest(original) !== digest(current))
      throw new Error("Candidate already edited; execute requires a fresh starter");
    const backend = new CommandBackend(
      parseCommand(await readJson(path.resolve(option(options, "backend"))))
    );
    await writeJson(path.join(directory, "started.json"), {
      startedAt: new Date().toISOString(),
    });
    const receipt = await backend.execute(request);
    await writeJson(path.join(directory, "receipt.json"), receipt);
    await writeJson(path.join(directory, "timing.json"), {
      total_tokens: receipt.totalTokens,
      duration_ms: receipt.durationMs,
    });
    return receipt;
  }
  throw new Error("Unknown command: " + command);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.stdout.write(
      JSON.stringify(await main(process.argv.slice(2)), null, 2) + "\n"
    );
  } catch (error) {
    process.stderr.write(String(error) + "\n");
    process.exitCode = 1;
  }
}
