#!/usr/bin/env node
/**
 * Shared utilities for repository-maintained Node-based scripts under `scripts/`.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Returns the repository root for a script living under the top-level scripts directory.
 */
export const getRepoRoot = (importMetaUrl: string) =>
  path.resolve(path.dirname(fileURLToPath(importMetaUrl)), "..");

/**
 * Reads and parses a UTF-8 JSON file.
 */
export const readJsonFile = <T,>(filePath: string): T => {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as T;
};

/**
 * Converts an unknown thrown value into a readable string.
 */
export const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/**
 * Returns true when the provided module URL matches the current Node entrypoint.
 */
export const isMainModule = (importMetaUrl: string) =>
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(importMetaUrl));
