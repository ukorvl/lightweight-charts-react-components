#!/usr/bin/env node
// Installs evaluator-owned known-good or deliberately broken implementations in
// a separate calibration iteration. These outputs are excluded from agent scores.
import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { readJson, writeJson } from "./io.mts";
import { runPath } from "./prepare.mts";
import { verify } from "./verify.mts";
import type { Manifest } from "./types.mts";

export function breakCalibration(name: string, source: string): string {
  const mutations: Record<string, [RegExp, string]> = {
    "live-candles": [
      /const detailData\s*=\s*data\.current;/,
      "const detailData = initial.current;",
    ],
    history: [
      /from:\s*current\.from\s*\+\s*older\.length,\s*to:\s*current\.to\s*\+\s*older\.length/,
      "from:current.from,to:current.to",
    ],
    volume: [/top:\s*0\.8,\s*bottom:\s*0/, "top:0,bottom:0"],
  };
  const pair = mutations[name];
  if (!pair || !pair[0].test(source))
    throw new Error("Calibration mutation target not found: " + name);
  return source.replace(pair[0], pair[1]);
}
export async function calibrate(repo: string, iteration: string) {
  const manifest = (await readJson(path.join(iteration, "manifest.json"))) as Manifest;
  if (manifest.repetitions !== 1) throw new Error("Calibration uses one repetition");
  for (const item of manifest.suite.evals)
    for (const arm of ["with_skill", "without_skill"] as const) {
      const directory = runPath(iteration, item.name, 1, arm);
      for (const file of ["started.json", "receipt.json"]) {
        const exists = await stat(path.join(directory, file)).then(
          () => true,
          () => false
        );
        if (exists) throw new Error("Calibration cannot overwrite an agent run");
      }
    }
  const results: { caseName: string; good: boolean; defectDetected: boolean }[] = [];
  const targets: Record<string, string> = {
    "live-candles": "live.stationary-hover-revision",
    history: "history.response-time-view",
    volume: "volume.panes-and-units",
  };
  for (const item of manifest.suite.evals) {
    const source = await readFile(
      path.join(repo, "scripts/skill-evals/calibration", item.name + ".tsx"),
      "utf8"
    );
    const good = runPath(iteration, item.name, 1, "with_skill");
    const bad = runPath(iteration, item.name, 1, "without_skill");
    await writeFile(path.join(good, "outputs/app/src/Task.tsx"), source);
    await writeFile(
      path.join(bad, "outputs/app/src/Task.tsx"),
      breakCalibration(item.name, source)
    );
    const goodGrade = await verify(repo, iteration, good, "calibration");
    const badGrade = await verify(repo, iteration, bad, "calibration");
    results.push({
      caseName: item.name,
      good: goodGrade.status === "PASS",
      defectDetected:
        badGrade.status === "FAIL" &&
        badGrade.assertions.some(
          result => result.id === targets[item.name] && result.status === "FAIL"
        ),
    });
  }
  await writeJson(path.join(iteration, "calibration.json"), {
    results,
    passed: results.every(result => result.good && result.defectDetected),
  });
  return results;
}
