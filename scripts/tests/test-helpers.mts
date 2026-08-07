import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach } from "vitest";

const tempDirs = new Set<string>();

export const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".."
);

export const createTempDir = (prefix = "lwc-react-scripts-tests-") => {
  const tempDir = mkdtempSync(path.join(os.tmpdir(), prefix));
  tempDirs.add(tempDir);
  return tempDir;
};

export const writeTextFile = (filePath: string, contents: string) => {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, contents);
};

export const writeJsonFile = (filePath: string, contents: unknown) => {
  writeTextFile(filePath, `${JSON.stringify(contents, null, 2)}\n`);
};

afterEach(() => {
  for (const tempDir of tempDirs) {
    rmSync(tempDir, { recursive: true, force: true });
  }

  tempDirs.clear();
});
