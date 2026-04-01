import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll } from "vitest";

const denoTestProjectDir = mkdtempSync(
  path.join(os.tmpdir(), "lightweight-charts-react-components-deno-")
);

process.env.DENO_TEST_PROJECT_DIR = denoTestProjectDir;

afterAll(() => {
  rmSync(denoTestProjectDir, { recursive: true, force: true });
});
