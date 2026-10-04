#!/usr/bin/env node
// Shared evaluation contracts: versioned input manifests, backend receipts, and
// evidence-based results. Modules consume these types; they do not execute runs.
export type Arm = "with_skill" | "without_skill";
export type EvalCase = {
  id: number;
  name: string;
  prompt: string;
  expected_output: string;
  files: string[];
  assertions?: string[];
};
export type Suite = {
  skill_name: string;
  version: number;
  stage: "pilot" | "frozen";
  evals: EvalCase[];
};
export type RunRequest = {
  version: 1;
  caseName: string;
  arm: Arm;
  projectDirectory: string;
  outputDirectory: string;
  prompt: string;
  skillPath: string | null;
  timeoutMs: number;
};
export type Receipt = {
  status: "completed" | "task_failed" | "invalid";
  backend: string;
  model: string | null;
  reasoningEffort: string | null;
  settingsHash: string | null;
  freshContext: boolean;
  filesystemIsolation: "verified" | "unverified";
  totalTokens: number | null;
  durationMs: number | null;
  reason: string | null;
};
export interface Backend {
  execute(request: RunRequest): Promise<Receipt>;
}
export type Assertion = {
  id: string;
  category: "gate" | "scenario";
  critical: boolean;
  status: "PASS" | "FAIL" | "NOT_EVALUATED";
  evidence: unknown;
};
export type Grade = {
  version: 1;
  caseName: string;
  arm: Arm;
  kind: "agent" | "calibration";
  evaluatorVersion: string;
  candidateHash: string;
  status: "PASS" | "FAIL" | "INVALID_RUN";
  assertions: Assertion[];
  reason: string | null;
};
export type Manifest = {
  version: 1;
  suite: Suite;
  hashes: Record<string, string>;
  environment: {
    node: string;
    platform: string;
    browser: string;
    viewport: { width: number; height: number };
    timezone: string;
  };
  repetitions: number;
  timeoutMs: number;
  protectedFiles: Record<string, string>;
};
