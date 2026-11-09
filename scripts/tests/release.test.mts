import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  DecisionNeeded,
  buildPrBody,
  bumpVersion,
  cutChangelog,
  isReleaseFile,
  main,
  pinSandboxMajor,
  readChangelogSection,
} from "../release.mts";
import { createTempDir, writeJsonFile, writeTextFile } from "./test-helpers.mts";

const CHANGELOG_HEADER = "# Changelog\n\n";
const SANDBOX = "examples/src/samples/Demo/sandbox/package.json";

const gitIn = (cwd: string, ...args: string[]) =>
  execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

const readText = (repo: string, file: string) =>
  readFileSync(path.join(repo, file), "utf8");

const changelog = (unreleased: string) =>
  `${CHANGELOG_HEADER}## [Unreleased]\n${unreleased}\n## [2.6.1] - 2026-10-31\n### Fixed\n- old fix\n`;

const setupRepos = (unreleased = "### Fixed\n- new fix\n") => {
  const root = createTempDir();
  const remote = path.join(root, "remote.git");
  const repo = path.join(root, "repo");

  gitIn(root, "init", "--quiet", "--bare", "-b", "main", remote);
  gitIn(root, "init", "--quiet", "-b", "main", repo);
  writeJsonFile(path.join(repo, "lib/package.json"), { version: "2.6.1" });
  writeTextFile(path.join(repo, "lib/CHANGELOG.md"), changelog(unreleased));
  writeJsonFile(path.join(repo, SANDBOX), {
    name: "lightweight-charts-react-components-demo",
    dependencies: { "lightweight-charts-react-components": "^2" },
  });
  gitIn(repo, "add", ".");
  gitIn(repo, "commit", "--quiet", "-m", "chore: v2.6.1");
  gitIn(repo, "tag", "-a", "v2.6.1", "-m", "release v2.6.1");
  gitIn(repo, "remote", "add", "origin", remote);
  gitIn(repo, "push", "--quiet", "origin", "main", "--tags");
  gitIn(repo, "branch", "--quiet", "--set-upstream-to", "origin/main");

  return { repo, remote };
};

const runRelease = (repo: string, argv: string[], published = false) => {
  const lines: string[] = [];
  const gh = vi.fn((args: string[]) =>
    args[1] === "create" ? "https://example.test/pull/1\n" : ""
  );

  main(argv, {
    repo,
    today: "2026-11-09",
    log: line => lines.push(line),
    checkVersions: () => {},
    isPublished: () => published,
    bumpVersionFiles: bump => {
      const file = path.join(repo, "lib/package.json");
      const pkg = JSON.parse(readFileSync(file, "utf8")) as { version: string };
      writeJsonFile(file, { ...pkg, version: bumpVersion(pkg.version, bump) });
    },
    gh,
  });

  return { output: lines.join("\n"), gh };
};

const commitFile = (repo: string, file: string, message: string) => {
  writeTextFile(path.join(repo, file), `${message}\n`);
  gitIn(repo, "add", file);
  gitIn(repo, "commit", "--quiet", "-m", message);
};

beforeAll(() => {
  vi.stubEnv("GIT_CONFIG_GLOBAL", "/dev/null");
  vi.stubEnv("GIT_CONFIG_NOSYSTEM", "1");
  vi.stubEnv("GIT_AUTHOR_NAME", "Release Test");
  vi.stubEnv("GIT_AUTHOR_EMAIL", "release@example.test");
  vi.stubEnv("GIT_COMMITTER_NAME", "Release Test");
  vi.stubEnv("GIT_COMMITTER_EMAIL", "release@example.test");
});

afterAll(() => {
  vi.unstubAllEnvs();
});

describe("release helpers", () => {
  it("bumps semver versions", () => {
    expect(bumpVersion("2.6.1", "patch")).toBe("2.6.2");
    expect(bumpVersion("2.6.1", "minor")).toBe("2.7.0");
    expect(bumpVersion("2.6.1", "major")).toBe("3.0.0");
    expect(() => bumpVersion("2.6", "patch")).toThrow("Unsupported version format");
  });

  it("moves unreleased entries under the new version", () => {
    const next = cutChangelog(changelog("### Fixed\n- new fix\n"), "2.7.0", "2026-11-09");

    expect(next).toBe(
      `${CHANGELOG_HEADER}## [Unreleased]\n\n## [2.7.0] - 2026-11-09\n### Fixed\n- new fix\n\n## [2.6.1] - 2026-10-31\n### Fixed\n- old fix\n`
    );
    expect(readChangelogSection(next ?? "", "2.7.0")).toBe(
      "## [2.7.0] - 2026-11-09\n### Fixed\n- new fix"
    );
  });

  it("returns undefined when there is nothing to release", () => {
    expect(cutChangelog(changelog(""), "2.7.0", "2026-11-09")).toBeUndefined();
    expect(cutChangelog(changelog("\n"), "2.7.0", "2026-11-09")).toBeUndefined();
  });

  it("merges late unreleased entries into an already cut section", () => {
    const tail = "## [2.6.1] - 2026-10-31\n### Fixed\n- older\n";
    const cut = `${CHANGELOG_HEADER}## [Unreleased]\n### Fixed\n- late fix\n- old fix\n### Added\n- new api\n\n## [2.7.0] - 2026-11-09\n### Fixed\n- old fix\n\n${tail}`;

    expect(cutChangelog(cut, "2.7.0", "2026-11-10")).toBe(
      `${CHANGELOG_HEADER}## [Unreleased]\n\n## [2.7.0] - 2026-11-09\n### Fixed\n- old fix\n- late fix\n### Added\n- new api\n\n${tail}`
    );
  });

  it("cuts a changelog whose unreleased section is the last one", () => {
    expect(cutChangelog("## [Unreleased]\n- a\n", "1.0.0", "2026-01-01")).toBe(
      "## [Unreleased]\n\n## [1.0.0] - 2026-01-01\n- a\n"
    );
    expect(() => cutChangelog("# Changelog\n", "1.0.0", "2026-01-01")).toThrow(
      'no "## [Unreleased]"'
    );
  });

  it("pins only the library dependency in sandboxes", () => {
    const json = `{"name": "lightweight-charts-react-components-x", "dependencies": {"lightweight-charts-react-components": "^2"}}`;

    expect(pinSandboxMajor(json, 3)).toBe(
      `{"name": "lightweight-charts-react-components-x", "dependencies": {"lightweight-charts-react-components": "^3"}}`
    );
  });

  it("recognizes release files", () => {
    expect(isReleaseFile("lib/package.json")).toBe(true);
    expect(isReleaseFile(SANDBOX)).toBe(true);
    expect(isReleaseFile("skills/demo/SKILL.md")).toBe(true);
    expect(isReleaseFile("lib/src/index.ts")).toBe(false);
  });

  it("builds the PR body from the changelog section", () => {
    const body = buildPrBody("2.7.0", "## [2.7.0] - 2026-11-09\n### Fixed\n- new fix");

    expect(body).toContain("Release `v2.7.0`.\n\n### Fixed\n- new fix\n");
    expect(body).toContain("tag `v2.7.0` on the `chore: v2.7.0` commit");
  });
});

describe("release prepare", () => {
  it("creates the release branch from origin/main and is safe to rerun", () => {
    const { repo } = setupRepos();
    const { output } = runRelease(repo, ["prepare", "minor"]);

    expect(output).toContain("release: v2.7.0 (minor from 2.6.1)");
    expect(output).toContain("branch: release-v2.7.0 (created from origin/main)");
    expect(output).toContain("changelog: added [2.7.0] - 2026-11-09");
    expect(output).toContain("version files: 2.6.1 -> 2.7.0");
    expect(output).toContain("sandboxes: already ^2");
    expect(gitIn(repo, "branch", "--show-current")).toBe("release-v2.7.0");
    // No upstream: `git config --get` exits non-zero for a missing key.
    expect(() => gitIn(repo, "config", "--get", "branch.release-v2.7.0.merge")).toThrow();

    const rerun = runRelease(repo, ["prepare", "minor"]).output;
    expect(rerun).toContain("branch: release-v2.7.0 (resumed)");
    expect(rerun).toContain("changelog: [2.7.0] already present");
    expect(rerun).toContain("version files: already 2.7.0");
    expect(readText(repo, "lib/CHANGELOG.md").match(/## \[2\.7\.0\]/g)).toHaveLength(1);
  });

  it("pins sandbox dependencies on a major release", () => {
    const { repo } = setupRepos();

    expect(runRelease(repo, ["prepare", "major"]).output).toContain(
      "sandboxes: pinned 1 file(s) to ^3"
    );
    expect(readText(repo, SANDBOX)).toContain(
      '"lightweight-charts-react-components": "^3"'
    );
  });

  it("asks before reusing a feature branch and supports rename and new", () => {
    const { repo } = setupRepos();
    gitIn(repo, "switch", "--quiet", "-c", "feature");
    commitFile(repo, "lib/src/feature.ts", "feat: feature");

    expect(() => runRelease(repo, ["prepare", "patch"])).toThrow(DecisionNeeded);
    expect(() => runRelease(repo, ["prepare", "patch"])).toThrow("--branch rename");

    runRelease(repo, ["prepare", "patch", "--branch", "new"]);
    expect(gitIn(repo, "branch", "--show-current")).toBe("release-v2.6.2");
    expect(gitIn(repo, "log", "--format=%s", "-1", "release-v2.6.2")).toBe(
      "chore: v2.6.1"
    );

    gitIn(repo, "stash", "--include-untracked", "--quiet");
    gitIn(repo, "switch", "--quiet", "feature");
    gitIn(repo, "branch", "--quiet", "-D", "release-v2.6.2");
    const { output } = runRelease(repo, ["prepare", "patch", "--branch", "rename"]);

    expect(output).toContain("branch: release-v2.6.2 (renamed from 'feature')");
    expect(gitIn(repo, "log", "--format=%s", "-1")).toBe("feat: feature");
    expect(gitIn(repo, "branch", "--list", "feature")).toBe("");
  });

  it("blocks commit on late unreleased entries until prepare merges them", () => {
    const { repo } = setupRepos();
    runRelease(repo, ["prepare", "minor"]);
    writeTextFile(
      path.join(repo, "lib/CHANGELOG.md"),
      readText(repo, "lib/CHANGELOG.md").replace(
        "## [Unreleased]\n",
        "## [Unreleased]\n### Fixed\n- late fix\n"
      )
    );

    expect(() => runRelease(repo, ["commit"])).toThrow(
      "entries under [Unreleased] that would miss v2.7.0"
    );
    expect(runRelease(repo, ["prepare", "minor"]).output).toContain(
      "changelog: merged new [Unreleased] entries into [2.7.0]"
    );
    expect(readText(repo, "lib/CHANGELOG.md")).toContain(
      "## [Unreleased]\n\n## [2.7.0] - 2026-11-09\n### Fixed\n- new fix\n- late fix\n"
    );
    expect(runRelease(repo, ["commit"]).output).toContain("chore: v2.7.0 (created)");
  });

  it("lists commits when the unreleased section is empty", () => {
    const { repo } = setupRepos("");
    commitFile(repo, "lib/src/fix.ts", "fix: something");
    gitIn(repo, "push", "--quiet", "origin", "main");

    expect(() => runRelease(repo, ["prepare", "patch"])).toThrow(
      /nothing under \[Unreleased\][\s\S]*- fix: something/
    );
  });

  it("refuses a version that is already tagged", () => {
    const { repo } = setupRepos();
    gitIn(repo, "tag", "-a", "v2.6.2", "-m", "release v2.6.2");

    expect(() => runRelease(repo, ["prepare", "patch"])).toThrow(
      "Tag v2.6.2 already exists"
    );
  });

  it("rejects bad arguments", () => {
    const { repo } = setupRepos();

    expect(() => runRelease(repo, ["prepare", "huge"])).toThrow("major, minor or patch");
    expect(() => runRelease(repo, ["prepare", "patch", "--branch", "x"])).toThrow(
      "--branch must be rename or new"
    );
    expect(() => runRelease(repo, ["prepare", "patch", "extra"])).toThrow(
      "Unexpected arguments"
    );
    expect(() => runRelease(repo, ["publish"])).toThrow("Usage:");
  });
});

describe("release commit, pr and tag", () => {
  it("commits, opens the PR, tags the branch commit, amends and moves the tag", () => {
    const { repo, remote } = setupRepos();
    const remoteTag = () => gitIn(remote, "rev-parse", "v2.7.0^{commit}");
    runRelease(repo, ["prepare", "minor"]);

    writeTextFile(path.join(repo, "lib/src/other.ts"), "export {};\n");
    expect(() => runRelease(repo, ["commit"])).toThrow(
      "Not release files: lib/src/other.ts"
    );
    gitIn(repo, "clean", "--quiet", "-f", "lib/src");

    expect(runRelease(repo, ["commit"]).output).toContain("chore: v2.7.0 (created)");
    expect(runRelease(repo, ["commit"]).output).toContain("(already committed)");
    expect(() => runRelease(repo, ["tag"])).toThrow("Run pr first");

    const first = runRelease(repo, ["pr"]);
    expect(first.output).toContain("pushed: origin/release-v2.7.0");
    expect(first.output).toContain("pr: https://example.test/pull/1 (created)");
    expect(first.gh).toHaveBeenCalledWith(
      expect.arrayContaining(["create", "--title", "chore: v2.7.0"]),
      expect.stringContaining("### Fixed\n- new fix")
    );

    const firstCommit = gitIn(repo, "rev-parse", "HEAD");
    expect(runRelease(repo, ["tag"]).output).toContain("(created, on origin)");
    expect(gitIn(repo, "cat-file", "-t", "v2.7.0")).toBe("tag");
    expect(remoteTag()).toBe(firstCommit);
    expect(runRelease(repo, ["tag"]).output).toContain("(exists, on origin)");

    writeTextFile(
      path.join(repo, "lib/CHANGELOG.md"),
      readText(repo, "lib/CHANGELOG.md").replace("- new fix", "- reworded fix")
    );
    expect(runRelease(repo, ["commit"]).output).toContain("chore: v2.7.0 (amended)");
    expect(gitIn(repo, "rev-list", "--count", "origin/main..HEAD")).toBe("1");
    expect(() => runRelease(repo, ["pr"])).toThrow(DecisionNeeded);
    expect(runRelease(repo, ["pr", "--force"]).output).toContain("(force-with-lease)");

    const amended = gitIn(repo, "rev-parse", "HEAD");
    expect(() => runRelease(repo, ["tag"])).toThrow(DecisionNeeded);
    expect(() => runRelease(repo, ["tag", "--move"], true)).toThrow(
      "already published on npm"
    );
    expect(remoteTag()).toBe(firstCommit);

    expect(runRelease(repo, ["tag", "--move"]).output).toContain("(moved, on origin)");
    expect(gitIn(repo, "rev-parse", "v2.7.0^{commit}")).toBe(amended);
    expect(remoteTag()).toBe(amended);
  });

  it("fetches a tag that only exists on origin", () => {
    const { repo, remote } = setupRepos();
    runRelease(repo, ["prepare", "patch"]);
    runRelease(repo, ["commit"]);
    runRelease(repo, ["pr"]);
    runRelease(repo, ["tag"]);
    gitIn(repo, "tag", "-d", "v2.6.2");

    expect(runRelease(repo, ["tag"]).output).toContain("(exists, on origin)");
    expect(gitIn(repo, "rev-parse", "v2.6.2")).toBe(gitIn(remote, "rev-parse", "v2.6.2"));
  });

  it("requires the release branch for commit, pr and tag", () => {
    const { repo } = setupRepos();

    expect(() => runRelease(repo, ["commit"])).toThrow("expected branch release-v2.6.1");
    expect(() => runRelease(repo, ["pr"])).toThrow("Run prepare first");
    expect(() => runRelease(repo, ["tag"])).toThrow("Run prepare first");
  });
});
