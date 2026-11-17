#!/usr/bin/env node

// Packs the built lib workspace and checks its declarations and runtime in two
// isolated npm installs. Run npm run build -w lib first. Failures propagate to CI.
// The installs live outside the repo and resolve from the registry, so each one
// gets a copy of the repo .npmrc to keep its install policy (min-release-age).

import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { getRepoRoot, isMainModule } from "./common.mts";

const scenarios = [
  { react: "18.2.0", reactMajor: "18", charts: "5.0.8" },
  { react: "19", reactMajor: "19", charts: "5" },
];

export const testPackedConsumer = (repoRoot = getRepoRoot(import.meta.url)) => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "lwc-packed-consumer-"));

  try {
    const packed = execFileSync(
      "npm",
      [
        "pack",
        "--workspace",
        "lib",
        "--ignore-scripts",
        "--pack-destination",
        tempDir,
        "--json",
      ],
      { cwd: repoRoot, encoding: "utf8" }
    );
    const [{ filename }] = JSON.parse(packed) as [{ filename: string }];
    const tarball = path.join(tempDir, filename);
    const fixture = path.join(repoRoot, "scripts", "fixtures", "packed-consumer");

    for (const { react, reactMajor, charts } of scenarios) {
      const cwd = path.join(tempDir, `react-${reactMajor}`);
      mkdirSync(cwd);
      for (const file of ["package.json", "tsconfig.json", "smoke.test.tsx"]) {
        copyFileSync(path.join(fixture, file), path.join(cwd, file));
      }
      copyFileSync(path.join(repoRoot, ".npmrc"), path.join(cwd, ".npmrc"));
      process.stdout.write(`\nReact ${react} + lightweight-charts ${charts}\n`);

      const options = { cwd, stdio: "inherit" } as const;
      execFileSync(
        "npm",
        [
          "install",
          "--ignore-scripts",
          "--strict-peer-deps",
          "--no-audit",
          "--no-fund",
          tarball,
          `react@${react}`,
          `react-dom@${react}`,
          `lightweight-charts@${charts}`,
          `@types/react@${reactMajor}`,
          `@types/react-dom@${reactMajor}`,
        ],
        options
      );
      execFileSync("npm", ["ls", "--depth=0"], options);
      execFileSync("npm", ["test"], options);
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
};

if (isMainModule(import.meta.url)) {
  testPackedConsumer();
}
