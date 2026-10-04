#!/usr/bin/env node
// Aggregates the declared matrix, retaining missing and invalid runs. Calibration,
// draft checks, or unverified execution metadata cannot establish skill value.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { digest, fileHashes, parseReceipt, readJson, writeJson } from "./io.mts";
import { runPath } from "./prepare.mts";
import type { Arm, Grade, Manifest, Receipt } from "./types.mts";

export type ResultRow = {
  caseName: string;
  repetition: number;
  arm: Arm;
  grade: Grade | null;
  receipt: Receipt | null;
};
export function summarize(rows: ResultRow[], stage: Manifest["suite"]["stage"]) {
  rows = rows.map(row => ({
    ...row,
    grade:
      row.grade && row.receipt?.status !== "completed" && row.receipt
        ? {
            ...row.grade,
            status: row.receipt.status === "invalid" ? "INVALID_RUN" : "FAIL",
          }
        : row.grade,
  }));
  const eligible = rows.filter(row => row.grade?.kind === "agent");
  const arms = (["with_skill", "without_skill"] as const).map(arm => {
    const expected = rows.filter(row => row.arm === arm);
    const actual = eligible.filter(row => row.arm === arm);
    const valid = actual.filter(row => row.grade?.status !== "INVALID_RUN");
    const successful = valid.filter(row => row.grade?.status === "PASS");
    const durations = valid.flatMap(row =>
      row.receipt?.durationMs === null || row.receipt?.durationMs === undefined
        ? []
        : [row.receipt.durationMs]
    );
    const tokens = valid.flatMap(row =>
      row.receipt?.totalTokens === null || row.receipt?.totalTokens === undefined
        ? []
        : [row.receipt.totalTokens]
    );
    const mean = (values: number[]) =>
      values.length
        ? values.reduce((sum, value) => sum + value, 0) / values.length
        : null;
    const byCase = [...new Set(expected.map(row => row.caseName))].map(caseName => {
      const caseRuns = valid.filter(row => row.caseName === caseName);
      return {
        caseName,
        successes: caseRuns.filter(row => row.grade?.status === "PASS").length,
        validRuns: caseRuns.length,
        expectedRuns: expected.filter(row => row.caseName === caseName).length,
      };
    });
    const rates = byCase.flatMap(item =>
      item.validRuns ? [item.successes / item.validRuns] : []
    );
    return {
      arm,
      expected: expected.length,
      graded: actual.length,
      valid: valid.length,
      successes: successful.length,
      invalid: actual.length - valid.length,
      missing: expected.filter(row => !row.grade).length,
      calibration: expected.filter(row => row.grade?.kind === "calibration").length,
      macroTaskSuccess: mean(rates),
      durationMs: { values: durations, mean: mean(durations) },
      totalTokens: { values: tokens, mean: mean(tokens) },
      byCase,
    };
  });
  let wins = 0;
  let losses = 0;
  let ties = 0;
  let unpaired = 0;
  for (const row of rows.filter(item => item.arm === "with_skill")) {
    const other = rows.find(
      item =>
        item.caseName === row.caseName &&
        item.repetition === row.repetition &&
        item.arm === "without_skill"
    );
    if (
      row.grade?.kind !== "agent" ||
      other?.grade?.kind !== "agent" ||
      row.grade.status === "INVALID_RUN" ||
      other.grade.status === "INVALID_RUN"
    ) {
      unpaired++;
      continue;
    }
    if (row.grade.status === other.grade.status) ties++;
    else if (row.grade.status === "PASS") wins++;
    else losses++;
  }
  const reasons = [
    ...(rows.length === 0 ||
    rows.some(
      row =>
        !rows.some(
          other =>
            other.caseName === row.caseName &&
            other.repetition === row.repetition &&
            other.arm !== row.arm
        )
    )
      ? ["The paired matrix is empty or incomplete."]
      : []),
    ...(stage !== "frozen"
      ? ["Assertions are draft; inspect pilot outputs before freezing."]
      : []),
    ...(rows.some(
      row =>
        !row.grade || row.grade.status === "INVALID_RUN" || row.grade.kind !== "agent"
    )
      ? ["The agent matrix is incomplete or contains invalid/calibration runs."]
      : []),
    ...(rows.some(
      row => !row.receipt?.freshContext || row.receipt.filesystemIsolation !== "verified"
    )
      ? ["Fresh context or filesystem isolation is unverified."]
      : []),
    ...(rows.some(row => row.receipt?.model === null || !row.receipt)
      ? ["Model metadata is unavailable."]
      : []),
    ...(rows.some(row => !row.receipt?.settingsHash)
      ? ["Backend tool/network configuration is unavailable."]
      : []),
    ...(new Set(eligible.map(row => row.grade?.evaluatorVersion)).size > 1
      ? ["Grading used different evaluator versions."]
      : []),
    ...(new Set(
      rows
        .filter(row => row.receipt)
        .map(row =>
          JSON.stringify([
            row.receipt?.backend,
            row.receipt?.model,
            row.receipt?.reasoningEffort,
            row.receipt?.settingsHash,
          ])
        )
    ).size > 1
      ? ["Backend, model, or reasoning settings differ between runs."]
      : []),
  ];
  return {
    version: 1,
    stage,
    comparisonEligible: reasons.length === 0,
    limitations: reasons,
    configurations: arms,
    paired: { wins, losses, ties, unpaired },
    failures: eligible.flatMap(row =>
      (row.grade?.assertions ?? [])
        .filter(result => result.critical && result.status !== "PASS")
        .map(result => ({
          caseName: row.caseName,
          arm: row.arm,
          repetition: row.repetition,
          id: result.id,
          status: result.status,
        }))
    ),
    rows,
  };
}
export async function report(iteration: string) {
  const manifest = (await readJson(path.join(iteration, "manifest.json"))) as Manifest;
  const rows: ResultRow[] = [];
  for (const item of manifest.suite.evals)
    for (let repetition = 1; repetition <= manifest.repetitions; repetition++)
      for (const arm of ["with_skill", "without_skill"] as const) {
        const directory = runPath(iteration, item.name, repetition, arm);
        let grade: Grade | null = null;
        let receipt: Receipt | null = null;
        try {
          grade = JSON.parse(
            await readFile(path.join(directory, "grading.json"), "utf8")
          ) as Grade;
        } catch {
          /* Missing remains explicit. */
        }
        try {
          receipt = parseReceipt(await readJson(path.join(directory, "receipt.json")));
        } catch {
          /* Missing remains explicit. */
        }
        if (grade) {
          try {
            if (
              grade.candidateHash !==
              digest(await fileHashes(path.join(directory, "outputs/app/src")))
            )
              grade = {
                ...grade,
                status: "INVALID_RUN",
                reason: "Candidate changed after verification",
              };
          } catch {
            grade = {
              ...grade,
              status: "INVALID_RUN",
              reason: "Candidate source is unavailable",
            };
          }
        }
        rows.push({ caseName: item.name, repetition, arm, grade, receipt });
      }
  const benchmark = summarize(rows, manifest.suite.stage);
  await writeJson(path.join(iteration, "benchmark.json"), benchmark);
  const feedbackPath = path.join(iteration, "feedback.json");
  try {
    await readFile(feedbackPath);
  } catch {
    await writeJson(feedbackPath, {
      cases: manifest.suite.evals.map(item => ({
        caseName: item.name,
        reviewed: false,
        architectureAccepted: null,
        notes: [],
      })),
    });
  }
  const lines = [
    "# Skill evaluation report",
    "",
    "Comparison eligible: " + benchmark.comparisonEligible,
    "",
    ...benchmark.limitations.map(reason => "- " + reason),
    "",
    "| Configuration | Task successes / valid | Missing | Invalid | Calibration |",
    "| --- | --- | --- | --- | --- |",
    ...benchmark.configurations.map(
      item =>
        "| " +
        item.arm +
        " | " +
        item.successes +
        "/" +
        item.valid +
        " | " +
        item.missing +
        " | " +
        item.invalid +
        " | " +
        item.calibration +
        " |"
    ),
    "",
    "Paired outcomes: " + JSON.stringify(benchmark.paired),
    "",
    "See benchmark.json for per-case evidence, raw timing/token values, and failures.",
    "Human review of running outputs and architecture explanations is still required.",
    "",
  ];
  const { writeFile } = await import("node:fs/promises");
  await writeFile(path.join(iteration, "report.md"), lines.join("\n"));
  return benchmark;
}
