#!/usr/bin/env node
// Portable JSON, path, and hashing helpers. Input trees must contain regular files;
// symlinks are rejected so snapshots cannot accidentally point at the author repo.
import { createHash } from "node:crypto";
import { cp, lstat, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Receipt, Suite } from "./types.mts";

export function safeName(value: string): string {
  if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(value)) throw new Error("Invalid name: " + value);
  return value;
}
export function resolveInside(root: string, relative: string): string {
  if (path.isAbsolute(relative)) throw new Error("Expected a relative path");
  const target = path.resolve(root, relative);
  if (
    target === path.resolve(root) ||
    !target.startsWith(path.resolve(root) + path.sep)
  ) {
    throw new Error("Path escapes root: " + relative);
  }
  return target;
}
export async function writeJson(file: string, value: unknown) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(value, null, 2) + "\n");
}
export async function readJson(file: string): Promise<unknown> {
  return JSON.parse(await readFile(file, "utf8")) as unknown;
}
export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Expected an object");
  return value as Record<string, unknown>;
}
export function parseSuite(value: unknown): Suite {
  const object = record(value);
  if (
    typeof object.skill_name !== "string" ||
    !Number.isInteger(object.version) ||
    !["pilot", "frozen"].includes(String(object.stage)) ||
    !Array.isArray(object.evals)
  )
    throw new Error("Invalid suite");
  const names = new Set<string>();
  const ids = new Set<number>();
  const evals = object.evals.map(valueCase => {
    const item = record(valueCase);
    if (
      typeof item.name !== "string" ||
      typeof item.id !== "number" ||
      !Number.isInteger(item.id) ||
      typeof item.prompt !== "string" ||
      typeof item.expected_output !== "string" ||
      !Array.isArray(item.files) ||
      !item.files.every(file => typeof file === "string")
    )
      throw new Error("Invalid case");
    safeName(item.name);
    if (names.has(item.name) || ids.has(item.id)) throw new Error("Duplicate case");
    names.add(item.name);
    ids.add(item.id);
    if (
      item.assertions !== undefined &&
      (!Array.isArray(item.assertions) ||
        !item.assertions.every(
          assertion => typeof assertion === "string" && assertion.length > 0
        ))
    )
      throw new Error("Invalid assertions");
    if (
      object.stage === "frozen" &&
      (!Array.isArray(item.assertions) || !item.assertions.length)
    )
      throw new Error("Frozen suite requires assertions");
    return {
      id: item.id,
      name: item.name,
      prompt: item.prompt,
      expected_output: item.expected_output,
      files: item.files as string[],
      ...(item.assertions ? { assertions: item.assertions as string[] } : {}),
    };
  });
  if (!evals.length) throw new Error("Empty suite");
  return {
    skill_name: safeName(object.skill_name),
    version: object.version as number,
    stage: object.stage as Suite["stage"],
    evals,
  };
}
export function parseReceipt(value: unknown): Receipt {
  const item = record(value);
  const nullableString = (key: string) =>
    item[key] === null || typeof item[key] === "string";
  const nullableNumber = (key: string) =>
    item[key] === null ||
    (typeof item[key] === "number" && Number.isFinite(item[key]) && item[key] >= 0);
  if (
    !["completed", "task_failed", "invalid"].includes(String(item.status)) ||
    typeof item.backend !== "string" ||
    !nullableString("model") ||
    !nullableString("reasoningEffort") ||
    !nullableString("settingsHash") ||
    typeof item.freshContext !== "boolean" ||
    !["verified", "unverified"].includes(String(item.filesystemIsolation)) ||
    !nullableNumber("totalTokens") ||
    !nullableNumber("durationMs") ||
    !nullableString("reason")
  )
    throw new Error("Invalid backend receipt");
  return item as Receipt;
}
export async function fileHashes(
  root: string,
  prefix = ""
): Promise<Record<string, string>> {
  const hashes: Record<string, string> = {};
  for (const entry of (
    await readdir(path.join(root, prefix), { withFileTypes: true })
  ).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.isSymbolicLink()) throw new Error("Symlink in snapshot: " + entry.name);
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) Object.assign(hashes, await fileHashes(root, relative));
    else if (entry.isFile())
      hashes[relative] = createHash("sha256")
        .update(await readFile(path.join(root, relative)))
        .digest("hex");
  }
  return hashes;
}
export function digest(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
export async function copyTree(source: string, destination: string) {
  await fileHashes(source);
  await cp(source, destination, { recursive: true });
}

export async function copyInput(source: string, destination: string) {
  const entry = await lstat(source);
  if (entry.isSymbolicLink()) throw new Error("Symlink input: " + source);
  if (entry.isDirectory()) return copyTree(source, destination);
  if (!entry.isFile()) throw new Error("Input is not a regular file or directory");
  await cp(source, path.join(destination, path.basename(source)));
}
