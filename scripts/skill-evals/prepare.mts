#!/usr/bin/env node
// Prepares a paired consumer fixture from a built public library and locked npm
// dependencies. Input: repo root and new iteration name. Output: immutable base,
// skill snapshot, manifests, and one run request per case/configuration/repetition.
import { spawnSync } from "node:child_process";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  copyTree,
  copyInput,
  digest,
  fileHashes,
  parseSuite,
  readJson,
  resolveInside,
  safeName,
  writeJson,
} from "./io.mts";
import type { Arm, Manifest, RunRequest } from "./types.mts";

export function iterationPath(repo: string, name: string) {
  return path.join(
    repo,
    "skills/lightweight-charts-react-components-workspace",
    safeName(name)
  );
}
export function runPath(iteration: string, name: string, repetition: number, arm: Arm) {
  if (
    !Number.isInteger(repetition) ||
    repetition < 1 ||
    !["with_skill", "without_skill"].includes(arm)
  )
    throw new Error("Invalid run coordinates");
  return path.join(iteration, "eval-" + safeName(name), "repeat-" + repetition, arm);
}
export async function prepare(
  repo: string,
  name: string,
  repetitions = 1,
  timeoutMs = 1200000,
  cache?: string
) {
  if (
    !Number.isInteger(repetitions) ||
    repetitions < 1 ||
    repetitions > 20 ||
    !Number.isInteger(timeoutMs) ||
    timeoutMs <= 0
  )
    throw new Error("Invalid limits");
  const iteration = iterationPath(repo, name);
  await mkdir(path.dirname(iteration), { recursive: true });
  await mkdir(iteration); // Refuse to overwrite previous results.
  const skill = path.join(repo, "skills/lightweight-charts-react-components");
  const evalDirectory = path.join(skill, "evals");
  const suite = parseSuite(await readJson(path.join(evalDirectory, "evals.json")));
  const base = path.join(iteration, ".prepared", "app");
  await copyTree(path.join(evalDirectory, "files/shared"), base);
  const vendor = path.join(base, "vendor/library");
  await mkdir(vendor, { recursive: true });
  await copyTree(path.join(repo, "lib/dist"), path.join(vendor, "dist"));
  await cp(path.join(repo, "lib/package.json"), path.join(vendor, "package.json"));
  await mkdir(path.join(base, "docs"), { recursive: true });
  await cp(path.join(repo, "lib/README.md"), path.join(base, "docs/library.md"));
  const artifactHash = digest(await fileHashes(vendor));
  const install = spawnSync(
    "npm",
    [
      "ci",
      "--ignore-scripts",
      "--install-links",
      "--offline",
      "--no-audit",
      "--no-fund",
      ...(cache ? ["--cache", cache] : []),
    ],
    { cwd: base, encoding: "utf8" }
  );
  await writeFile(
    path.join(iteration, "dependency-install.log"),
    install.stdout + install.stderr
  );
  if (install.status !== 0)
    throw new Error(
      "Consumer install failed; see dependency-install.log. Populate the npm cache using the documented fixture setup."
    );
  const snapshot = path.join(iteration, "skill-snapshot");
  await mkdir(snapshot);
  await cp(path.join(skill, "SKILL.md"), path.join(snapshot, "SKILL.md"));
  await copyTree(path.join(skill, "references"), path.join(snapshot, "references"));
  const hashes: Record<string, string> = {
    skill: digest(await fileHashes(snapshot)),
    suite: digest(suite),
    library: artifactHash,
    lockfile: digest(await readFile(path.join(base, "package-lock.json"), "utf8")),
    evaluator: digest(await fileHashes(path.join(repo, "scripts/skill-evals"))),
    fixtures: digest(await fileHashes(path.join(evalDirectory, "files"))),
  };
  const protectedFiles: Record<string, string> = {};
  const manifest: Manifest = {
    version: 1,
    suite,
    hashes,
    repetitions,
    timeoutMs,
    protectedFiles,
    environment: {
      node: process.version,
      platform: process.platform,
      browser: "Chromium (resolved version recorded during verification)",
      viewport: { width: 1000, height: 800 },
      timezone: "UTC",
    },
  };
  for (const item of suite.evals) {
    const starter = path.join(iteration, ".prepared", item.name);
    await cp(base, starter, { recursive: true });
    for (const input of item.files) {
      if (input !== "files/shared")
        await copyInput(resolveInside(evalDirectory, input), starter);
    }
    const sourceHashes = { ...(await fileHashes(path.join(starter, "src"))) };
    for (const [relative, hash] of Object.entries(sourceHashes)) {
      if (relative !== "Task.tsx") protectedFiles[item.name + "/src/" + relative] = hash;
    }
    for (const file of [
      "package.json",
      "package-lock.json",
      "tsconfig.json",
      "index.html",
    ]) {
      protectedFiles[item.name + "/" + file] = digest(
        await readFile(path.join(starter, file), "utf8")
      );
    }
    for (let repetition = 1; repetition <= repetitions; repetition++) {
      // Alternate treatment order; preserve coordinates in the request.
      const arms: Arm[] =
        repetition % 2
          ? ["without_skill", "with_skill"]
          : ["with_skill", "without_skill"];
      for (const arm of arms) {
        const directory = runPath(iteration, item.name, repetition, arm);
        await mkdir(path.join(directory, "outputs"), { recursive: true });
        await cp(starter, path.join(directory, "outputs/app"), { recursive: true });
        if (arm === "with_skill")
          await copyTree(snapshot, path.join(directory, "outputs/skill"));
        const request: RunRequest = {
          version: 1,
          caseName: item.name,
          arm,
          projectDirectory: path.join(directory, "outputs/app"),
          outputDirectory: directory,
          timeoutMs,
          prompt: item.prompt,
          skillPath: arm === "with_skill" ? "../skill/SKILL.md" : null,
        };
        await writeJson(path.join(directory, "request.json"), request);
        await writeFile(
          path.join(directory, "prompt.txt"),
          item.prompt +
            (request.skillPath ? "\nUse the skill at " + request.skillPath + ".\n" : "\n")
        );
      }
    }
  }
  await writeJson(path.join(iteration, "manifest.json"), manifest);
  return iteration;
}
