import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createTempDir } from "./test-helpers.mts";
import { CommandBackend, parseCommand } from "../skill-evals/backend.mts";
import { breakCalibration, calibrate } from "../skill-evals/calibrate.mts";
import { main, parseArguments } from "../skill-evals/cli.mts";
import {
  digest,
  copyInput,
  fileHashes,
  parseReceipt,
  parseSuite,
  resolveInside,
  safeName,
} from "../skill-evals/io.mts";
import { iterationPath, prepare, runPath } from "../skill-evals/prepare.mts";
import { report, summarize } from "../skill-evals/report.mts";
import { taskStatus } from "../skill-evals/verify.mts";
import type { ResultRow } from "../skill-evals/report.mts";
import type { Assertion, Grade, Receipt, RunRequest } from "../skill-evals/types.mts";

const receipt: Receipt = {
  status: "completed",
  backend: "test-runner",
  model: "test-model",
  reasoningEffort: "high",
  settingsHash: "test-settings",
  freshContext: true,
  filesystemIsolation: "verified",
  totalTokens: 100,
  durationMs: 200,
  reason: null,
};
const assertion: Assertion = {
  id: "behavior",
  category: "scenario",
  critical: true,
  status: "PASS",
  evidence: { actual: 1, expected: 1 },
};
const grade: Grade = {
  version: 1,
  caseName: "history",
  arm: "with_skill",
  kind: "agent",
  evaluatorVersion: "v1",
  candidateHash: "hash",
  status: "PASS",
  assertions: [assertion],
  reason: null,
};
const row = (arm: ResultRow["arm"], override: Partial<ResultRow> = {}): ResultRow => ({
  caseName: "history",
  repetition: 1,
  arm,
  grade: { ...grade, arm },
  receipt,
  ...override,
});

describe("skill-eval contracts and containment", () => {
  it("copies standalone fixture files as well as directory inputs", async () => {
    const root = createTempDir();
    const destination = path.join(root, "app");
    await mkdir(destination);
    const source = path.join(root, "data.json");
    await writeFile(source, "[1,2]");
    await copyInput(source, destination);
    expect(await readFile(path.join(destination, "data.json"), "utf8")).toBe("[1,2]");
  });
  it("loads the entire CLI graph in native Node strip-only mode", () => {
    const result = spawnSync(process.execPath, ["scripts/skill-evals/cli.mts", "help"], {
      encoding: "utf8",
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Commands:");
  });
  it("rejects traversal, duplicate cases, and invalid execution metadata", () => {
    expect(() => safeName("../outside")).toThrow();
    expect(() => resolveInside("/root", "../../outside")).toThrow();
    expect(() => resolveInside("/root", "/absolute")).toThrow();
    const item = {
      id: 1,
      name: "history",
      prompt: "p",
      expected_output: "e",
      files: ["files/shared"],
    };
    expect(
      parseSuite({ skill_name: "charts", version: 1, stage: "pilot", evals: [item] })
        .evals
    ).toHaveLength(1);
    expect(() =>
      parseSuite({ skill_name: "charts", version: 1, stage: "frozen", evals: [item] })
    ).toThrow("requires assertions");
    expect(
      parseSuite({
        skill_name: "charts",
        version: 1,
        stage: "frozen",
        evals: [{ ...item, assertions: ["The chart preserves the viewed candles."] }],
      }).evals[0].assertions
    ).toHaveLength(1);
    expect(() =>
      parseSuite({
        skill_name: "charts",
        version: 1,
        stage: "pilot",
        evals: [item, item],
      })
    ).toThrow("Duplicate");
    expect(() => parseReceipt({ ...receipt, totalTokens: -1 })).toThrow();
    expect(() => parseReceipt({ ...receipt, totalTokens: "100" })).toThrow();
    expect(() => parseCommand({ command: "runner", args: "--shell" })).toThrow();
    expect(parseReceipt({ ...receipt, totalTokens: null }).totalTokens).toBeNull();
  });
  it("produces stable tree hashes and detects source changes", async () => {
    const directory = createTempDir();
    await writeFile(path.join(directory, "file.txt"), "original");
    const before = await fileHashes(directory);
    expect(digest(await fileHashes(directory))).toBe(digest(before));
    await writeFile(path.join(directory, "file.txt"), "changed");
    expect(digest(await fileHashes(directory))).not.toBe(digest(before));
  });
  it("rejects invalid coordinates and refuses to overwrite an iteration", async () => {
    const repo = createTempDir();
    expect(() => runPath(repo, "history", 0, "with_skill")).toThrow();
    await mkdir(iterationPath(repo, "existing"), { recursive: true });
    await expect(prepare(repo, "existing")).rejects.toThrow();
    await expect(prepare(repo, "another", -1)).rejects.toThrow("Invalid limits");
    expect(() =>
      parseArguments(["verify", "--arm", "with_skill", "--arm", "without_skill"])
    ).toThrow();
    await expect(
      main(
        ["nonsense", "--iteration", "missing", "--arm", "wrong", "--case", "history"],
        repo
      )
    ).rejects.toThrow("Invalid arm");
  });
});

describe("command backend", () => {
  function request(directory: string, timeoutMs = 5000): RunRequest {
    return {
      version: 1,
      caseName: "history",
      arm: "with_skill",
      projectDirectory: directory,
      outputDirectory: directory,
      prompt: "build",
      skillPath: null,
      timeoutMs,
    };
  }
  it("passes JSON and literal arguments without shell expansion and records elapsed time", async () => {
    const directory = createTempDir();
    const script =
      'let data="";process.stdin.on("data",chunk=>data+=chunk);process.stdin.on("end",()=>{const request=JSON.parse(data);process.stderr.write(request.prompt);process.stdout.write(JSON.stringify(' +
      JSON.stringify(receipt) +
      "));});";
    const backend = new CommandBackend({
      command: process.execPath,
      args: ["-e", script, "literal;printf injected"],
    });
    const result = await backend.execute(request(directory));
    expect(result.status).toBe("completed");
    expect(result.model).toBe("test-model");
    expect(result.durationMs).toBeGreaterThan(0);
    const transcript = JSON.parse(
      await readFile(path.join(directory, "transcript.json"), "utf8")
    ) as { stderr: string };
    expect(transcript.stderr).toBe("build");
  });
  it("classifies a missing executable as infrastructure failure", async () => {
    const directory = createTempDir();
    const result = await new CommandBackend({
      command: path.join(directory, "missing"),
      args: [],
    }).execute(request(directory));
    expect(result.status).toBe("invalid");
    expect(result.reason).toContain("ENOENT");
  });
  it("terminates timed-out work and leaves tokens unavailable", async () => {
    const directory = createTempDir();
    const result = await new CommandBackend({
      command: process.execPath,
      args: ["-e", "setTimeout(()=>{},60000)"],
    }).execute(request(directory, 80));
    expect(result.status).toBe("task_failed");
    expect(result.totalTokens).toBeNull();
    expect(result.reason).toContain("wall-clock");
  });
  it("rejects malformed receipts instead of inventing success", async () => {
    const directory = createTempDir();
    const result = await new CommandBackend({
      command: process.execPath,
      args: ["-e", 'process.stdout.write("not json")'],
    }).execute(request(directory));
    expect(result.status).toBe("invalid");
  });
});

describe("grading and aggregation", () => {
  it("invalidates changed candidates and preserves existing human feedback", async () => {
    const iteration = createTempDir();
    const item = { id: 1, name: "history", prompt: "p", expected_output: "e", files: [] };
    await writeFile(
      path.join(iteration, "manifest.json"),
      JSON.stringify({ suite: { stage: "frozen", evals: [item] }, repetitions: 1 })
    );
    for (const arm of ["with_skill", "without_skill"] as const) {
      const directory = runPath(iteration, "history", 1, arm);
      await mkdir(path.join(directory, "outputs/app/src"), { recursive: true });
      await writeFile(path.join(directory, "outputs/app/src/Task.tsx"), "original");
      const candidateHash = digest(
        await fileHashes(path.join(directory, "outputs/app/src"))
      );
      await writeFile(
        path.join(directory, "grading.json"),
        JSON.stringify({ ...grade, arm, candidateHash })
      );
      await writeFile(path.join(directory, "receipt.json"), JSON.stringify(receipt));
    }
    expect((await report(iteration)).comparisonEligible).toBe(true);
    await writeFile(
      path.join(iteration, "feedback.json"),
      JSON.stringify({ notes: ["keep my review"] })
    );
    await writeFile(
      path.join(
        runPath(iteration, "history", 1, "with_skill"),
        "outputs/app/src/Task.tsx"
      ),
      "changed"
    );
    const result = await report(iteration);
    expect(result.comparisonEligible).toBe(false);
    expect(result.rows[0].grade?.status).toBe("INVALID_RUN");
    expect(await readFile(path.join(iteration, "feedback.json"), "utf8")).toContain(
      "keep my review"
    );
  });
  it("does not treat an empty matrix as a comparison", () => {
    expect(summarize([], "frozen").comparisonEligible).toBe(false);
  });
  it("never lets a critical failure be diluted by passing assertions", () => {
    const failed = { ...assertion, status: "FAIL" as const };
    expect(taskStatus([assertion, failed], receipt)).toBe("FAIL");
    expect(taskStatus([assertion], { ...receipt, status: "task_failed" })).toBe("FAIL");
    expect(taskStatus([assertion], { ...receipt, status: "invalid" })).toBe(
      "INVALID_RUN"
    );
    expect(taskStatus([], receipt)).toBe("FAIL");
  });
  it("reports paired wins and a valid frozen comparison without fabricated tokens", () => {
    const rows = [
      row("with_skill"),
      row("without_skill", {
        grade: {
          ...grade,
          arm: "without_skill",
          status: "FAIL",
          assertions: [{ ...assertion, status: "FAIL" }],
        },
        receipt: { ...receipt, totalTokens: null },
      }),
    ];
    const result = summarize(rows, "frozen");
    expect(result.comparisonEligible).toBe(true);
    expect(result.paired).toEqual({ wins: 1, losses: 0, ties: 0, unpaired: 0 });
    expect(
      result.configurations.find(item => item.arm === "without_skill")?.totalTokens.mean
    ).toBeNull();
  });
  it("excludes calibration and keeps missing, invalid, and unverified runs visible", () => {
    const rows = [
      row("with_skill", { grade: { ...grade, kind: "calibration" } }),
      row("without_skill", { grade: null, receipt: null }),
    ];
    const result = summarize(rows, "pilot");
    expect(result.comparisonEligible).toBe(false);
    expect(result.configurations[0].valid).toBe(0);
    expect(result.configurations[0].calibration).toBe(1);
    expect(result.configurations[1].missing).toBe(1);
    expect(result.paired.unpaired).toBe(1);
    const invalid = summarize(
      [
        row("with_skill", { receipt: { ...receipt, status: "invalid" } }),
        row("without_skill"),
      ],
      "frozen"
    );
    expect(invalid.configurations[0].invalid).toBe(1);
  });
  it("blocks mixed models and grades with a changed evaluator", () => {
    const result = summarize(
      [
        row("with_skill"),
        row("without_skill", {
          receipt: { ...receipt, model: "other" },
          grade: { ...grade, arm: "without_skill", evaluatorVersion: "v2" },
        }),
      ],
      "frozen"
    );
    expect(result.comparisonEligible).toBe(false);
    expect(result.limitations.join(" ")).toContain("settings differ");
    expect(result.limitations.join(" ")).toContain("different evaluator");
  });
  it("weights cases equally even when repetition counts differ", () => {
    const rows = [
      row("with_skill"),
      row("with_skill", { repetition: 2 }),
      row("with_skill", {
        caseName: "volume",
        grade: { ...grade, caseName: "volume", status: "FAIL" },
      }),
    ];
    expect(summarize(rows, "frozen").configurations[0].macroTaskSuccess).toBe(0.5);
  });
});

describe("calibration mutations", () => {
  it("refuses to overwrite a real execution even inside a calibration iteration", async () => {
    const root = createTempDir();
    await writeFile(
      path.join(root, "manifest.json"),
      JSON.stringify({ repetitions: 1, suite: { evals: [{ name: "history" }] } })
    );
    const directory = runPath(root, "history", 1, "with_skill");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "started.json"), "{}");
    await expect(calibrate(root, root)).rejects.toThrow("cannot overwrite");
  });
  it("targets semantic defects regardless of formatting and refuses missing targets", () => {
    expect(breakCalibration("live-candles", "const detailData = data.current;")).toBe(
      "const detailData = initial.current;"
    );
    expect(
      breakCalibration(
        "history",
        "from: current.from + older.length,\n to: current.to + older.length"
      )
    ).toBe("from:current.from,to:current.to");
    expect(breakCalibration("volume", "top: 0.8, bottom: 0")).toBe("top:0,bottom:0");
    expect(() => breakCalibration("volume", "unrelated code")).toThrow(
      "target not found"
    );
  });
});
