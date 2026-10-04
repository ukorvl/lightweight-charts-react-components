#!/usr/bin/env node
// Verifies an untouched candidate using evaluator-owned compiler/build settings
// and draft real-browser oracles. Artifacts stay in the run's checks/ directory.
import { spawnSync } from "node:child_process";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { chromium } from "@playwright/test";
import { createServer } from "vite";
import { checkers } from "./checks/index.mts";
import { digest, fileHashes, parseReceipt, readJson, record, writeJson } from "./io.mts";
import type { Assertion, Grade, Manifest, Receipt, RunRequest } from "./types.mts";

export function taskStatus(
  assertions: Assertion[],
  receipt: Receipt | null
): Grade["status"] {
  if (receipt?.status === "invalid") return "INVALID_RUN";
  if (receipt?.status === "task_failed") return "FAIL";
  return assertions.length > 0 &&
    assertions.every(result => !result.critical || result.status === "PASS")
    ? "PASS"
    : "FAIL";
}
export async function verify(
  repo: string,
  iteration: string,
  directory: string,
  kind: Grade["kind"] = "agent"
): Promise<Grade> {
  const manifest = (await readJson(path.join(iteration, "manifest.json"))) as Manifest;
  const request = (await readJson(path.join(directory, "request.json"))) as RunRequest;
  const checker = checkers[request.caseName];
  if (!checker) throw new Error("No checker for " + request.caseName);
  const candidate = path.join(directory, "outputs/app");
  const evidenceDirectory = path.join(directory, "checks");
  await mkdir(evidenceDirectory, { recursive: true });
  // Version each grading pass: preserve the previous grade and evidence.
  const passDirectory = path.join(evidenceDirectory, "pass-" + Date.now());
  await mkdir(passDirectory);
  const assertions: Assertion[] = [];
  let receipt: Receipt | null = null;
  try {
    receipt = parseReceipt(await readJson(path.join(directory, "receipt.json")));
  } catch {
    /* A manual draft can be checked before metadata is supplied. */
  }
  const grade: Grade = {
    version: 1,
    caseName: request.caseName,
    arm: request.arm,
    kind,
    evaluatorVersion: digest(await fileHashes(path.join(repo, "scripts/skill-evals"))),
    candidateHash: "",
    status: "FAIL",
    assertions,
    reason: null,
  };
  const finish = async () => {
    grade.status = taskStatus(assertions, receipt);
    await writeJson(path.join(passDirectory, "grading.json"), grade);
    await writeJson(path.join(directory, "grading.json"), grade);
    return grade;
  };
  const changes: string[] = [];
  let sourceHashes: Record<string, string> = {};
  try {
    sourceHashes = await fileHashes(path.join(candidate, "src"));
  } catch (error) {
    changes.push("src: " + String(error));
  }
  grade.candidateHash = digest(sourceHashes);
  for (const [key, expected] of Object.entries(manifest.protectedFiles)) {
    if (!key.startsWith(request.caseName + "/")) continue;
    const relative = key.slice(request.caseName.length + 1);
    try {
      const actual = relative.startsWith("src/")
        ? sourceHashes[relative.slice(4)]
        : digest(await readFile(path.join(candidate, relative), "utf8"));
      if (actual !== expected) changes.push(relative);
    } catch {
      changes.push(relative);
    }
  }
  assertions.push({
    id: "gate.input-integrity",
    category: "gate",
    critical: true,
    status: changes.length ? "FAIL" : "PASS",
    evidence: { changedProtectedFiles: changes },
  });
  if (changes.length) return finish();
  const staging = path.join(passDirectory, "app");
  await cp(path.join(iteration, ".prepared", request.caseName), staging, {
    recursive: true,
  });
  await cp(path.join(candidate, "src"), path.join(staging, "src"), { recursive: true });
  const commands = [
    {
      id: "gate.typecheck",
      binary: "node_modules/typescript/bin/tsc",
      args: ["-p", "tsconfig.json"],
    },
    { id: "gate.build", binary: "node_modules/vite/bin/vite.js", args: ["build"] },
  ];
  for (const command of commands) {
    const result = spawnSync(
      process.execPath,
      [path.join(staging, command.binary), ...command.args],
      { cwd: staging, encoding: "utf8", timeout: 60000 }
    );
    const output =
      (result.stdout ?? "") +
      (result.stderr ?? "") +
      (result.error ? String(result.error) : "");
    await writeFile(path.join(passDirectory, command.id + ".log"), output);
    assertions.push({
      id: command.id,
      category: "gate",
      critical: true,
      status: result.status === 0 ? "PASS" : "FAIL",
      evidence: {
        exitCode: result.status,
        log: path.relative(directory, path.join(passDirectory, command.id + ".log")),
      },
    });
  }
  if (assertions.some(result => result.status !== "PASS")) return finish();
  await mkdir(path.join(staging, ".evaluator"));
  await cp(
    path.join(repo, "scripts/skill-evals/browser/observer.mjs"),
    path.join(staging, ".evaluator/observer.mjs")
  );
  const require = createRequire(path.join(staging, "package.json"));
  const nativeManifestPath = require.resolve("lightweight-charts/package.json");
  const nativeManifest = record(await readJson(nativeManifestPath));
  const importEntry = record(record(record(nativeManifest.exports)["."]).default).import;
  if (typeof importEntry !== "string")
    throw new Error("Missing public native import entry");
  let server: Awaited<ReturnType<typeof createServer>> | undefined;
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  let browserReady = false;
  try {
    server = await createServer({
      configFile: false,
      root: staging,
      logLevel: "silent",
      // Prevent dependency discovery from reloading the page during assertions.
      optimizeDeps: {
        noDiscovery: true,
        include: [
          "react",
          "react/jsx-runtime",
          "react/jsx-dev-runtime",
          "react-dom",
          "react-dom/client",
          "fancy-canvas",
        ],
        exclude: ["lightweight-charts", "lightweight-charts-react-components"],
      },
      resolve: {
        alias: [
          {
            find: /^lightweight-charts$/,
            replacement: path.join(staging, ".evaluator/observer.mjs"),
          },
          {
            find: "@eval/native",
            replacement: path.resolve(path.dirname(nativeManifestPath), importEntry),
          },
        ],
      },
      server: { host: "127.0.0.1", port: 0, strictPort: false },
    });
    await server.listen();
    const address = server.httpServer?.address();
    if (!address || typeof address === "string") throw new Error("No Vite address");
    browser = await chromium.launch({ headless: true });
    await writeJson(path.join(passDirectory, "environment.json"), {
      ...manifest.environment,
      browser: browser.version(),
    });
    const context = await browser.newContext({
      viewport: manifest.environment.viewport,
      timezoneId: "UTC",
      deviceScaleFactor: 1,
    });
    await context.tracing.start({ screenshots: true, snapshots: true });
    const page = await context.newPage();
    browserReady = true;
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto("http://127.0.0.1:" + address.port);
    await checker({ page, results: assertions });
    assertions.push({
      id: "gate.browser-errors",
      category: "gate",
      critical: true,
      status: errors.length ? "FAIL" : "PASS",
      evidence: { errors },
    });
    await page.screenshot({
      path: path.join(passDirectory, "result.png"),
      fullPage: true,
    });
    await writeJson(path.join(passDirectory, "observations.json"), assertions);
    await context.tracing.stop({ path: path.join(passDirectory, "trace.zip") });
    await context.close();
  } catch (error) {
    if (browserReady) {
      assertions.push({
        id: "gate.browser-execution",
        category: "gate",
        critical: true,
        status: "FAIL",
        evidence: { error: String(error) },
      });
      return finish();
    }
    // Tooling launch/setup failures invalidate the run; failures inside a checker
    // are assertions and remain task failures.
    grade.reason = "Verifier infrastructure failure: " + String(error);
    grade.status = "INVALID_RUN";
    await writeJson(path.join(passDirectory, "grading.json"), grade);
    await writeJson(path.join(directory, "grading.json"), grade);
    return grade;
  } finally {
    await browser?.close();
    await server?.close();
  }
  return finish();
}
