import path from "node:path";
import { describe, expect, it } from "vitest";
import { run } from "../check-versions-in-sync.mts";
import {
  README_VERSION_REFERENCES,
  resolveReadmeVersionReference,
} from "../readme-version-references.mts";
import { createTempDir, writeJsonFile, writeTextFile } from "./test-helpers.mts";

const createCheckerOptions = (repo: string) => ({
  repo,
  packageJson: "lib/package.json",
  jsrJson: "lib/jsr.json",
  versionFile: "lib/src/version.ts",
  packageLock: "package-lock.json",
  lockPackageKey: "lib",
  readmeFiles: ["lib/README.md"],
});

const writeFixtureRepo = (repo: string, version = "2.6.0") => {
  writeJsonFile(path.join(repo, "lib/package.json"), { version });
  writeJsonFile(path.join(repo, "lib/jsr.json"), { version });
  writeJsonFile(path.join(repo, "package-lock.json"), {
    packages: {
      lib: {
        version,
      },
    },
  });
  writeTextFile(
    path.join(repo, "lib/src/version.ts"),
    `export const version = "${version}";\n`
  );
  writeTextFile(
    path.join(repo, "lib/README.md"),
    `${README_VERSION_REFERENCES.map(reference => resolveReadmeVersionReference(reference, version)).join("\n")}\n`
  );
};

describe("check-versions-in-sync", () => {
  it("confirms when release version files stay aligned", () => {
    const repo = createTempDir();
    writeFixtureRepo(repo);

    expect(run(createCheckerOptions(repo))).toEqual([
      "lib/jsr.json (2.6.0) matches package.json version (2.6.0).",
      "package-lock.json (2.6.0) matches package.json version (2.6.0).",
      "lib/src/version.ts (2.6.0) matches package.json version (2.6.0).",
      "Version-pinned README references in lib/README.md match 2.6.0.",
      "All release version files are in sync at v2.6.0.",
    ]);
  });

  it("throws when a required version source drifts from package.json", () => {
    const repo = createTempDir();
    writeFixtureRepo(repo);
    writeTextFile(
      path.join(repo, "lib/src/version.ts"),
      'export const version = "2.5.9";\n'
    );

    expect(() => run(createCheckerOptions(repo))).toThrow(
      "lib/src/version.ts (2.5.9) does not match package.json version (2.6.0)"
    );
  });
});
