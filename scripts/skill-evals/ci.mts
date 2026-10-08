#!/usr/bin/env node
// Runs deterministic evaluator calibration for local checks and CI. Inputs:
// built library plus locked consumer fixtures. Outputs: a fresh calibration-ci-*
// workspace and report; model backends are never invoked or counted as evaluated.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { main } from "./cli.mts";

export async function runCalibration(
  run: (args: string[]) => Promise<unknown> = args => main(args)
) {
  const iteration = "calibration-ci-" + Date.now();
  await run(["setup"]);
  await run(["prepare", "--iteration", iteration]);
  return run(["calibrate", "--iteration", iteration]);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.stdout.write(JSON.stringify(await runCalibration(), null, 2) + "\n");
  } catch (error) {
    process.stderr.write(String(error) + "\n");
    process.exitCode = 1;
  }
}
