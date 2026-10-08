#!/usr/bin/env node
// External-runner adapter. Sends one JSON RunRequest on stdin and accepts one
// Receipt on stdout; stderr is retained as a transcript. No shell interpolation.
import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { parseReceipt, record } from "./io.mts";
import type { Backend, Receipt, RunRequest } from "./types.mts";

export type CommandConfig = { command: string; args: string[] };
export function parseCommand(value: unknown): CommandConfig {
  const item = record(value);
  if (
    typeof item.command !== "string" ||
    !Array.isArray(item.args) ||
    !item.args.every(arg => typeof arg === "string")
  )
    throw new Error("Expected command and args");
  return { command: item.command, args: item.args as string[] };
}
export class CommandBackend implements Backend {
  private config: CommandConfig;
  constructor(config: CommandConfig) {
    this.config = config;
  }
  async execute(request: RunRequest): Promise<Receipt> {
    const started = Date.now();
    const fallback = (status: Receipt["status"], reason: string): Receipt => ({
      status,
      reason,
      backend: "command",
      model: null,
      reasoningEffort: null,
      settingsHash: null,
      freshContext: false,
      filesystemIsolation: "unverified",
      totalTokens: null,
      durationMs: Date.now() - started,
    });
    const result = await new Promise<{
      stdout: string;
      stderr: string;
      error: string | null;
      timedOut: boolean;
    }>(resolve => {
      const child = spawn(this.config.command, this.config.args, {
        cwd: request.projectDirectory,
        detached: process.platform !== "win32",
        stdio: ["pipe", "pipe", "pipe"],
      });
      let stdout = "";
      let stderr = "";
      let error: string | null = null;
      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        try {
          if (process.platform !== "win32" && child.pid)
            process.kill(-child.pid, "SIGKILL");
          else child.kill("SIGKILL");
        } catch {
          /* Already exited. */
        }
      }, request.timeoutMs);
      child.stdout.on("data", chunk => {
        stdout += String(chunk);
      });
      child.stderr.on("data", chunk => {
        stderr += String(chunk);
      });
      child.on("error", cause => {
        error = cause.message;
      });
      child.stdin.on("error", () => {
        /* Spawn failure can close stdin first. */
      });
      child.on("close", code => {
        clearTimeout(timer);
        if (code !== 0 && !error) error = "Runner exited with code " + code;
        resolve({ stdout, stderr, error, timedOut });
      });
      child.stdin.end(JSON.stringify(request) + "\n");
    });
    await writeFile(
      path.join(request.outputDirectory, "transcript.json"),
      JSON.stringify(result, null, 2)
    );
    if (result.timedOut)
      return fallback("task_failed", "Run exceeded the shared wall-clock limit");
    if (result.error) return fallback("invalid", result.error);
    try {
      const receipt = parseReceipt(JSON.parse(result.stdout) as unknown);
      return { ...receipt, durationMs: Date.now() - started };
    } catch (error) {
      return fallback("invalid", "Invalid runner receipt: " + String(error));
    }
  }
}
