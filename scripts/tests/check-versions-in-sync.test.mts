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
  skillFile: "skills/demo/SKILL.md",
});

const SKILL_FILE = "skills/demo/SKILL.md";

const skillTable = `| Dependency | Reference | Range |
| --- | --- | --- |
| \`lightweight-charts-react-components\` | \`2.6.0\` | Recipe target: \`>=2.6.0 <3\`. Prose. |
| \`lightweight-charts\` | \`5.2.1\` | Declared peer: \`>=5.0.8 <6\`. |
| React and React DOM | \`19.2.6\` | Declared peers: \`>=18.2 <20\`. Prose. |
| Node.js | — | Package engines: \`>=18.14.0\`. Prose. |
`;

const writeFixtureRepo = (repo: string, version = "2.6.0") => {
  writeJsonFile(path.join(repo, "lib/package.json"), {
    version,
    peerDependencies: {
      "lightweight-charts": ">=5.0.8 <6",
      react: ">=18.2 <20",
      "react-dom": ">=18.2 <20",
    },
    engines: { node: ">=18.14.0" },
  });
  writeTextFile(path.join(repo, SKILL_FILE), skillTable);
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
      `Compatibility table in ${SKILL_FILE} matches package.json.`,
      "All release version files are in sync at v2.6.0.",
    ]);
  });

  it("allows newer library releases inside the skill recipe target", () => {
    const repo = createTempDir();
    writeFixtureRepo(repo, "2.7.0");
    writeTextFile(path.join(repo, SKILL_FILE), skillTable);

    expect(run(createCheckerOptions(repo))).toContain(
      "All release version files are in sync at v2.7.0."
    );
  });

  it("throws when a library release leaves the skill recipe target", () => {
    const repo = createTempDir();
    writeFixtureRepo(repo, "3.0.0");

    expect(() => run(createCheckerOptions(repo))).toThrow(
      `package.json version (3.0.0) is outside the ${SKILL_FILE} recipe target (>=2.6.0 <3)`
    );
  });

  it("throws when a skill range drifts from package.json", () => {
    const repo = createTempDir();
    writeFixtureRepo(repo);
    writeTextFile(
      path.join(repo, SKILL_FILE),
      skillTable.replace("`>=5.0.8 <6`", "`>=5.0.0 <6`")
    );

    expect(() => run(createCheckerOptions(repo))).toThrow(
      `${SKILL_FILE} lightweight-charts range (>=5.0.0 <6) does not match package.json (>=5.0.8 <6)`
    );
  });

  it("throws when a skill reference version leaves its range", () => {
    const repo = createTempDir();
    writeFixtureRepo(repo);
    writeTextFile(
      path.join(repo, SKILL_FILE),
      skillTable.replace("`19.2.6`", "`20.0.0`")
    );

    expect(() => run(createCheckerOptions(repo))).toThrow(
      `${SKILL_FILE} react reference version (20.0.0) is outside >=18.2 <20`
    );
  });

  it("throws when the skill compatibility table is missing a row", () => {
    const repo = createTempDir();
    writeFixtureRepo(repo);
    writeTextFile(path.join(repo, SKILL_FILE), "# No table\n");

    expect(() => run(createCheckerOptions(repo))).toThrow(
      "Could not read `lightweight-charts-react-components` compatibility row"
    );
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
