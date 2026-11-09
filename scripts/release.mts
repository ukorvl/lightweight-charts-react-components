#!/usr/bin/env node
/**
 * Release helper behind the `release-manager` agent skill (`.agents/skills/release-manager`).
 *
 * Usage: node scripts/release.mts <command> [--repo <path>]
 *   prepare <major|minor|patch> [--branch rename|new]
 *       Create or resume `release-vX.Y.Z`, bump every version file through `npm run version`,
 *       move `[Unreleased]` changelog entries under `[X.Y.Z] - <today>`, pin sandbox
 *       dependencies to the release major, and run the version sync check.
 *   check    Run the release validation suite, one line per check.
 *   commit   Stage release files and create (or amend) the single `chore: vX.Y.Z` commit.
 *   pr [--force]
 *       Push the release branch and open (or reuse) the release PR to `main`.
 *   tag [--move]
 *       Create annotated tag `vX.Y.Z` on the pushed release commit and push it, so the
 *       `Release` workflow can run on it before the PR is merged. `--move` re-creates a tag
 *       that points elsewhere (after an amended release commit) unless the version is on npm.
 *
 * Inputs: the git checkout with an `origin` remote, `npm` for prepare/check/tag, `gh` for pr.
 * Outputs: short `key: value` lines on stdout. Exit code 1 is an error (stderr says how to fix
 * it); exit code 2 is a decision for the user (stdout lists the options and the flag for each).
 * Details: the target version is computed from `origin/main:lib/package.json`, so every command
 * can be rerun; a resumed branch keeps its bump and changelog cut instead of applying them twice.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { defaultOptions, run as checkVersionsInSync } from "./check-versions-in-sync.mts";
import { getErrorMessage, isMainModule } from "./common.mts";

const BASE_BRANCH = "main";
const REMOTE = "origin";
const REMOTE_BASE = `${REMOTE}/${BASE_BRANCH}`;
const CHANGELOG = "lib/CHANGELOG.md";
const SAMPLES_DIR = "examples/src/samples";
const BUMPS = ["major", "minor", "patch"] as const;
const BRANCH_MODES = ["rename", "new"] as const;

/** Files a release commit may contain; anything else has to be committed separately. */
const RELEASE_FILES = [
  /^lib\/(package\.json|jsr\.json|src\/version\.ts|CHANGELOG\.md|README\.md)$/,
  /^package-lock\.json$/,
  /^(MIGRATION|SECURITY|CONTRIBUTING)\.md$/,
  /^examples\/README\.md$/,
  /^examples\/src\/samples\/[^/]+\/sandbox\/package\.json$/,
  /^skills\//,
];

/** Validation run by `check`; skill recipes are added when `skills/` differs from main. */
const CHECKS: Array<[name: string, npmArgs: string[]]> = [
  ["versions", ["run", "check:versions-in-sync"]],
  ["format", ["run", "format"]],
  ["lint", ["run", "lint"]],
  ["typecheck", ["run", "typecheck"]],
  ["lib unit tests", ["run", "test:unit", "-w", "lib", "--", "--run"]],
  ["build", ["run", "build"]],
  ["jsdoc links", ["run", "check:jsdoc-links"]],
  ["md links", ["run", "check:md-links"]],
  ["knip", ["run", "knip"]],
];

const USAGE = `Usage: node scripts/release.mts <command> [--repo <path>]
  prepare <major|minor|patch> [--branch rename|new]
  check
  commit
  pr [--force]
  tag [--move]`;

export type Bump = (typeof BUMPS)[number];
export type BranchMode = (typeof BRANCH_MODES)[number];

/** A choice the user has to make; the CLI prints it and exits with code 2. */
export class DecisionNeeded extends Error {}

export type ReleaseContext = {
  repo: string;
  today: string;
  log: (line: string) => void;
  bumpVersionFiles: (bump: Bump) => void;
  checkVersions: () => void;
  gh: (args: string[], input?: string) => string;
  isPublished: (version: string) => boolean;
};

const exec = (command: string, args: string[], cwd: string, input?: string) => {
  const result = spawnSync(command, args, {
    cwd,
    input,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });

  if (result.error) {
    throw result.error;
  }

  return result;
};

const runOrThrow = (command: string, args: string[], cwd: string, input?: string) => {
  const result = exec(command, args, cwd, input);

  if (result.status !== 0) {
    const output = (result.stderr || result.stdout).trim();
    throw new Error(`${command} ${args.join(" ")} failed:\n${output}`);
  }

  return result.stdout.trimEnd();
};

const localDate = () => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export const createContext = (
  overrides: Partial<ReleaseContext> = {}
): ReleaseContext => {
  const repo = path.resolve(overrides.repo ?? ".");

  return {
    today: localDate(),
    log: line => process.stdout.write(`${line}\n`),
    bumpVersionFiles: bump => {
      runOrThrow("npm", ["run", "version", "--", bump], repo);
    },
    checkVersions: () => {
      checkVersionsInSync({ ...defaultOptions, repo });
    },
    gh: (args, input) => runOrThrow("gh", args, repo, input),
    isPublished: version => {
      const name = readPackageJson(repo).name;
      const result = exec("npm", ["view", `${name}@${version}`, "version"], repo);

      if (result.status === 0) return result.stdout.trim() === version;
      if (result.stderr.includes("E404")) return false;
      throw new Error(`npm view ${name}@${version} failed:\n${result.stderr.trim()}`);
    },
    ...overrides,
    repo,
  };
};

export const bumpVersion = (version: string, bump: Bump) => {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);

  if (!match) {
    throw new Error(`Unsupported version format: ${version}`);
  }

  const [major, minor, patch] = match.slice(1).map(Number);

  if (bump === "major") return `${major + 1}.0.0`;
  if (bump === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
};

/** Returns the `## [version]` section including its heading, or undefined. */
export const readChangelogSection = (changelog: string, version: string) => {
  const start = changelog.indexOf(`## [${version}]`);

  if (start === -1) {
    return undefined;
  }

  const end = changelog.indexOf("\n## [", start);
  return changelog.slice(start, end === -1 ? undefined : end).trim();
};

/** Moves `[Unreleased]` entries under a new version heading; undefined when there are none. */
export const cutChangelog = (changelog: string, version: string, date: string) => {
  const heading = changelog.indexOf("## [Unreleased]");

  if (heading === -1) {
    throw new Error(`${CHANGELOG} has no "## [Unreleased]" section.`);
  }

  const bodyStart = changelog.indexOf("\n", heading) + 1;
  const next = bodyStart === 0 ? -1 : changelog.indexOf("\n## [", bodyStart - 1);
  const bodyEnd = next === -1 ? changelog.length : next + 1;
  const body = bodyStart === 0 ? "" : changelog.slice(bodyStart, bodyEnd).trim();

  if (!body) {
    return undefined;
  }

  const rest = changelog.slice(bodyEnd);
  return `${changelog.slice(0, bodyStart)}\n## [${version}] - ${date}\n${body}\n${rest ? `\n${rest}` : ""}`;
};

export const pinSandboxMajor = (packageJson: string, major: number) =>
  packageJson.replace(
    /("lightweight-charts-react-components"\s*:\s*")[^"]*"/,
    `$1^${major}"`
  );

export const isReleaseFile = (file: string) =>
  RELEASE_FILES.some(pattern => pattern.test(file));

export const buildPrBody = (version: string, section: string) =>
  [
    `Release \`v${version}\`.`,
    "",
    section.replace(/^## .*\n?/, "").trim(),
    "",
    `Release flow: tag \`v${version}\` on the \`chore: v${version}\` commit, run the \`Release\` workflow on that tag, then merge this PR with **Create a merge commit** once the release succeeds.`,
    "",
  ].join("\n");

const git = (ctx: ReleaseContext, ...args: string[]) => runOrThrow("git", args, ctx.repo);

const gitSucceeds = (ctx: ReleaseContext, ...args: string[]) =>
  exec("git", args, ctx.repo).status === 0;

const countCommits = (ctx: ReleaseContext, range: string) =>
  Number(git(ctx, "rev-list", "--count", range));

const readVersion = (packageJson: string) => {
  const version = (JSON.parse(packageJson) as { version?: unknown }).version;

  if (typeof version !== "string") {
    throw new Error("lib/package.json has no version.");
  }

  return version;
};

const readPackageJson = (repo: string) =>
  JSON.parse(readFileSync(path.join(repo, "lib/package.json"), "utf8")) as {
    name?: string;
  };

const workingVersion = (ctx: ReleaseContext) =>
  readVersion(readFileSync(path.join(ctx.repo, "lib/package.json"), "utf8"));

const versionAt = (ctx: ReleaseContext, ref: string) =>
  readVersion(git(ctx, "show", `${ref}:lib/package.json`));

const readChangelog = (ctx: ReleaseContext) =>
  readFileSync(path.join(ctx.repo, CHANGELOG), "utf8");

const changedFiles = (ctx: ReleaseContext) =>
  git(ctx, "status", "--porcelain", "--untracked-files=all")
    .split("\n")
    .filter(Boolean)
    .map(line => ({
      file: line.slice(3).split(" -> ").at(-1) ?? "",
      untracked: line.startsWith("??"),
    }));

const remoteBranchSha = (ctx: ReleaseContext, branch: string) =>
  git(ctx, "ls-remote", "--heads", REMOTE, `refs/heads/${branch}`).split(/\s/)[0];

const fetchBase = (ctx: ReleaseContext) =>
  git(ctx, "fetch", "--quiet", REMOTE, BASE_BRANCH);

const localTagCommit = (ctx: ReleaseContext, name: string) =>
  gitSucceeds(ctx, "rev-parse", "--quiet", "--verify", `refs/tags/${name}^{commit}`)
    ? git(ctx, "rev-parse", `refs/tags/${name}^{commit}`)
    : "";

/** Commit a remote tag points to; annotated tags are peeled through their `^{}` entry. */
const remoteTagCommit = (ctx: ReleaseContext, name: string) => {
  const refs = new Map(
    git(ctx, "ls-remote", REMOTE, `refs/tags/${name}`, `refs/tags/${name}^{}`)
      .split("\n")
      .filter(Boolean)
      .map(line => line.split("\t").reverse() as [string, string])
  );

  return refs.get(`refs/tags/${name}^{}`) ?? refs.get(`refs/tags/${name}`) ?? "";
};

const assertOnReleaseBranch = (ctx: ReleaseContext) => {
  const version = workingVersion(ctx);
  const branch = `release-v${version}`;
  const current = git(ctx, "branch", "--show-current");

  if (current !== branch) {
    throw new Error(
      `lib/package.json is ${version}, so expected branch ${branch}, but on '${current || "detached HEAD"}'. Run prepare first.`
    );
  }

  return { version, branch, message: `chore: v${version}` };
};

const switchToReleaseBranch = (
  ctx: ReleaseContext,
  branch: string,
  mode?: BranchMode
) => {
  const current = git(ctx, "branch", "--show-current");

  if (!current) {
    throw new Error("HEAD is detached. Switch to a branch and rerun.");
  }
  if (current === branch) {
    return "resumed";
  }

  const changes = changedFiles(ctx);
  const localExists = gitSucceeds(
    ctx,
    "show-ref",
    "--verify",
    "--quiet",
    `refs/heads/${branch}`
  );

  if (localExists || remoteBranchSha(ctx, branch)) {
    if (changes.length) {
      throw new Error(
        `${branch} already exists. Commit or stash the ${changes.length} changed file(s) on '${current}', then rerun to switch to it.`
      );
    }
    if (localExists) {
      git(ctx, "switch", "--quiet", branch);
    } else {
      git(ctx, "fetch", "--quiet", REMOTE, branch);
      git(ctx, "switch", "--quiet", "--track", "-c", branch, `${REMOTE}/${branch}`);
    }
    return `switched to existing ${branch}`;
  }

  if (current === BASE_BRANCH) {
    const foreign = changes.filter(
      change => change.untracked || !isReleaseFile(change.file)
    );

    if (foreign.length) {
      throw new Error(
        `Uncommitted non-release files on ${BASE_BRANCH}: ${foreign.map(change => change.file).join(", ")}. Commit or stash them first.`
      );
    }
    if (countCommits(ctx, `${REMOTE_BASE}..HEAD`) > 0) {
      throw new Error(
        `Local ${BASE_BRANCH} has commits that are not on ${REMOTE_BASE}. Push them through a PR or move them to another branch first.`
      );
    }
    git(ctx, "switch", "--quiet", "--no-track", "-c", branch, REMOTE_BASE);
    return `created from ${REMOTE_BASE}`;
  }

  if (!mode) {
    const ahead = git(ctx, "log", "--format=  %h %s", `${REMOTE_BASE}..HEAD`);
    throw new DecisionNeeded(
      [
        `decision: current branch '${current}' is neither ${BASE_BRANCH} nor ${branch}.`,
        `commits not on ${REMOTE_BASE}:${ahead ? `\n${ahead}` : " none"}`,
        `uncommitted files: ${changes.length}`,
        `--branch rename: rename '${current}' to '${branch}'; its commits and uncommitted changes ship in the release PR.`,
        `--branch new: create '${branch}' from ${REMOTE_BASE}; '${current}' stays as is (needs a clean worktree).`,
      ].join("\n")
    );
  }

  if (mode === "new") {
    if (changes.length) {
      throw new Error(
        `Commit or stash the ${changes.length} changed file(s) on '${current}' before --branch new.`
      );
    }
    git(ctx, "switch", "--quiet", "--no-track", "-c", branch, REMOTE_BASE);
    return `created from ${REMOTE_BASE}; '${current}' unchanged`;
  }

  git(ctx, "branch", "-m", branch);
  gitSucceeds(ctx, "branch", "--unset-upstream");
  const oldRemote = remoteBranchSha(ctx, current)
    ? `; ${REMOTE}/${current} and any PR from it stay open, close them once the release PR is up`
    : "";
  return `renamed from '${current}'${oldRemote}`;
};

const syncWithBase = (ctx: ReleaseContext, branch: string) => {
  if (gitSucceeds(ctx, "merge-base", "--is-ancestor", REMOTE_BASE, "HEAD")) {
    return;
  }
  if (countCommits(ctx, `${REMOTE_BASE}..HEAD`) === 0) {
    git(ctx, "merge", "--quiet", "--ff-only", REMOTE_BASE);
    ctx.log(`sync: fast-forwarded to ${REMOTE_BASE}`);
    return;
  }

  const behind = countCommits(ctx, `HEAD..${REMOTE_BASE}`);
  throw new Error(
    `${branch} is ${behind} commit(s) behind ${REMOTE_BASE} and has its own commits. Ask the user whether to merge or rebase ${REMOTE_BASE} into it, do that, then rerun prepare.`
  );
};

const cutUnreleased = (ctx: ReleaseContext, base: string, version: string) => {
  const changelog = readChangelog(ctx);

  if (readChangelogSection(changelog, version)) {
    return `[${version}] already present`;
  }

  const next = cutChangelog(changelog, version, ctx.today);

  if (!next) {
    const since = gitSucceeds(
      ctx,
      "rev-parse",
      "--quiet",
      "--verify",
      `refs/tags/v${base}`
    )
      ? `v${base}`
      : REMOTE_BASE;
    const commits = git(
      ctx,
      "log",
      "--no-merges",
      "-n",
      "50",
      "--format=- %s (%h)",
      `${since}..HEAD`
    );
    throw new Error(
      `${CHANGELOG} has nothing under [Unreleased]. Write user-facing entries there (### Added / ### Changed / ### Fixed, like earlier releases), then rerun prepare. Commits since ${since}:\n${commits || "(none)"}`
    );
  }

  writeFileSync(path.join(ctx.repo, CHANGELOG), next);
  return `added [${version}] - ${ctx.today}`;
};

const bumpFiles = (ctx: ReleaseContext, bump: Bump, base: string, version: string) => {
  const current = workingVersion(ctx);

  if (current === version) {
    return `already ${version}`;
  }
  if (current !== base) {
    throw new Error(
      `lib/package.json is ${current}; expected ${base} (to bump) or ${version}. Restore the version files or choose the bump that matches.`
    );
  }

  ctx.bumpVersionFiles(bump);
  return `${base} -> ${version} (npm run version -- ${bump})`;
};

const pinSandboxes = (ctx: ReleaseContext, version: string) => {
  const major = Number(version.split(".")[0]);
  const samplesDir = path.join(ctx.repo, SAMPLES_DIR);
  const samples = existsSync(samplesDir) ? readdirSync(samplesDir) : [];
  let changed = 0;

  for (const sample of samples) {
    const file = path.join(samplesDir, sample, "sandbox/package.json");

    if (!existsSync(file)) continue;

    const before = readFileSync(file, "utf8");
    const after = pinSandboxMajor(before, major);

    if (after !== before) {
      writeFileSync(file, after);
      changed += 1;
    }
  }

  return changed ? `pinned ${changed} file(s) to ^${major}` : `already ^${major}`;
};

export const prepare = (ctx: ReleaseContext, bump: Bump, mode?: BranchMode) => {
  fetchBase(ctx);

  const base = versionAt(ctx, REMOTE_BASE);
  const version = bumpVersion(base, bump);
  const branch = `release-v${version}`;

  const resuming = git(ctx, "branch", "--show-current") === branch;

  if (
    !resuming &&
    (localTagCommit(ctx, `v${version}`) || remoteTagCommit(ctx, `v${version}`))
  ) {
    throw new Error(
      `Tag v${version} already exists outside ${branch}. Choose another bump.`
    );
  }

  ctx.log(`release: v${version} (${bump} from ${base})`);
  ctx.log(`branch: ${branch} (${switchToReleaseBranch(ctx, branch, mode)})`);
  syncWithBase(ctx, branch);
  ctx.log(`changelog: ${cutUnreleased(ctx, base, version)}`);
  ctx.log(`version files: ${bumpFiles(ctx, bump, base, version)}`);
  ctx.log(`sandboxes: ${pinSandboxes(ctx, version)}`);
  ctx.checkVersions();
  ctx.log("versions: in sync");
  ctx.log(
    `changed: ${
      changedFiles(ctx)
        .map(change => change.file)
        .join(", ") || "none"
    }`
  );
  ctx.log(`--- ${CHANGELOG} ---\n${readChangelogSection(readChangelog(ctx), version)}`);
};

export const check = (ctx: ReleaseContext) => {
  const skillsChanged =
    git(ctx, "diff", "--name-only", REMOTE_BASE, "--", "skills") !== "";
  const checks: typeof CHECKS = skillsChanged
    ? [...CHECKS, ["skill recipes", ["run", "check:skill-recipes"]]]
    : CHECKS;
  const failed: string[] = [];

  for (const [name, npmArgs] of checks) {
    const started = Date.now();
    const result = exec("npm", npmArgs, ctx.repo);
    const seconds = Math.round((Date.now() - started) / 1000);

    if (result.status === 0) {
      ctx.log(`ok   ${name} (${seconds}s)`);
      continue;
    }

    failed.push(name);
    const tail = `${result.stdout}\n${result.stderr}`.trim().split("\n").slice(-30);
    ctx.log(`FAIL ${name} (${seconds}s): npm ${npmArgs.join(" ")}\n${tail.join("\n")}`);
  }

  if (failed.length) {
    throw new Error(`Failed checks: ${failed.join(", ")}`);
  }
};

export const commit = (ctx: ReleaseContext) => {
  const { version, message } = assertOnReleaseBranch(ctx);

  if (!readChangelogSection(readChangelog(ctx), version)) {
    throw new Error(`${CHANGELOG} has no [${version}] section. Run prepare first.`);
  }
  ctx.checkVersions();

  const changes = changedFiles(ctx);
  const blocked = changes.filter(
    change => change.untracked || !isReleaseFile(change.file)
  );

  if (blocked.length) {
    throw new Error(
      `Not release files: ${blocked.map(change => change.file).join(", ")}. Commit them separately or stash them, then rerun.`
    );
  }

  const amend = git(ctx, "log", "-1", "--format=%s") === message;

  if (!changes.length) {
    if (!amend) {
      throw new Error("Nothing to commit. Run prepare first.");
    }
    ctx.log(`commit: ${git(ctx, "log", "-1", "--format=%h %s")} (already committed)`);
    return;
  }

  git(ctx, "add", "--", ...changes.map(change => change.file));
  git(ctx, "commit", "--quiet", ...(amend ? ["--amend", "--no-edit"] : ["-m", message]));
  ctx.log(
    `commit: ${git(ctx, "log", "-1", "--format=%h %s")} (${amend ? "amended" : "created"})`
  );
  ctx.log(`files: ${changes.map(change => change.file).join(", ")}`);
};

export const pr = (ctx: ReleaseContext, force: boolean) => {
  const { version, branch, message } = assertOnReleaseBranch(ctx);

  if (git(ctx, "log", "-1", "--format=%s") !== message) {
    throw new Error(`HEAD is not the release commit '${message}'. Run commit first.`);
  }
  if (changedFiles(ctx).length) {
    throw new Error(
      "The worktree has uncommitted changes. Run commit first (it amends the release commit)."
    );
  }

  fetchBase(ctx);
  if (!gitSucceeds(ctx, "merge-base", "--is-ancestor", REMOTE_BASE, "HEAD")) {
    throw new Error(
      `${branch} does not contain ${REMOTE_BASE}. Rerun prepare to bring it up to date.`
    );
  }

  const remoteSha = remoteBranchSha(ctx, branch);
  let forced = false;

  if (remoteSha) {
    git(ctx, "fetch", "--quiet", REMOTE, branch);
    if (!gitSucceeds(ctx, "merge-base", "--is-ancestor", remoteSha, "HEAD")) {
      if (!force) {
        throw new DecisionNeeded(
          `decision: ${REMOTE}/${branch} has commits that HEAD does not (usually the release commit was amended).\n--force: replace it with git push --force-with-lease.`
        );
      }
      forced = true;
    }
  }

  git(
    ctx,
    "push",
    "--quiet",
    ...(forced ? ["--force-with-lease"] : []),
    "-u",
    REMOTE,
    branch
  );
  ctx.log(`pushed: ${REMOTE}/${branch}${forced ? " (force-with-lease)" : ""}`);

  const existing = ctx
    .gh([
      "pr",
      "list",
      "--head",
      branch,
      "--base",
      BASE_BRANCH,
      "--state",
      "open",
      "--json",
      "url",
      "--jq",
      ".[0].url // empty",
    ])
    .trim();

  if (existing) {
    ctx.log(`pr: ${existing} (updated)`);
    return;
  }

  const section = readChangelogSection(readChangelog(ctx), version) ?? "";
  const url = ctx
    .gh(
      [
        "pr",
        "create",
        "--base",
        BASE_BRANCH,
        "--head",
        branch,
        "--title",
        message,
        "--body-file",
        "-",
      ],
      buildPrBody(version, section)
    )
    .trim();
  ctx.log(`pr: ${url} (created)`);
};

export const tag = (ctx: ReleaseContext, move: boolean) => {
  const { version, branch, message } = assertOnReleaseBranch(ctx);
  const name = `v${version}`;
  const head = git(ctx, "rev-parse", "HEAD");

  if (git(ctx, "log", "-1", "--format=%s") !== message || changedFiles(ctx).length) {
    throw new Error(`HEAD must be a clean '${message}' commit. Run commit and pr first.`);
  }
  if (remoteBranchSha(ctx, branch) !== head) {
    throw new Error(
      `${REMOTE}/${branch} is not at HEAD. Run pr first so the tag points to the commit under review.`
    );
  }

  const local = localTagCommit(ctx, name);
  const remote = remoteTagCommit(ctx, name);
  const stale = [local, remote].find(sha => sha && sha !== head);

  if (stale) {
    if (!move) {
      throw new DecisionNeeded(
        `decision: tag ${name} points to ${stale.slice(0, 7)}, not to HEAD ${head.slice(0, 7)} (${message}).\n--move: delete ${name} locally and on ${REMOTE}, then tag HEAD; refused if ${version} is already on npm.`
      );
    }
    if (ctx.isPublished(version)) {
      throw new Error(
        `${version} is already published on npm, so ${name} must stay. Release a new patch instead.`
      );
    }
    if (remote) git(ctx, "push", "--quiet", REMOTE, `:refs/tags/${name}`);
    if (local) git(ctx, "tag", "-d", name);
  }

  let state = "exists";

  if (stale || (!local && !remote)) {
    git(ctx, "tag", "-a", name, "-m", `release ${name}`, head);
    state = stale ? "moved" : "created";
  } else if (!local) {
    git(ctx, "fetch", "--quiet", REMOTE, `refs/tags/${name}:refs/tags/${name}`);
  }
  if (stale || remote !== head) {
    git(ctx, "push", "--quiet", REMOTE, `refs/tags/${name}`);
  }

  ctx.log(`tag: ${name} -> ${head.slice(0, 7)} ${message} (${state}, on ${REMOTE})`);
};

const takeFlag = (args: string[], flag: string) => {
  const index = args.indexOf(flag);

  if (index === -1) return false;
  args.splice(index, 1);
  return true;
};

const takeOption = (args: string[], option: string) => {
  const index = args.indexOf(option);

  if (index === -1) return undefined;

  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${option} needs a value.\n${USAGE}`);
  }
  args.splice(index, 2);
  return value;
};

const assertNodeVersion = (repo: string) => {
  const nvmrc = path.join(repo, ".nvmrc");

  if (!existsSync(nvmrc)) return;

  const wanted = readFileSync(nvmrc, "utf8").trim().replace(/^v/, "").split(".")[0];
  const actual = process.versions.node.split(".")[0];

  if (wanted !== actual) {
    throw new Error(
      `Node ${process.versions.node} does not match .nvmrc (${wanted}). Run \`nvm use\` and rerun.`
    );
  }
};

const isOneOf = <T extends string>(values: readonly T[], value?: string): value is T =>
  values.includes(value as T);

export const main = (argv: string[], overrides: Partial<ReleaseContext> = {}) => {
  const args = [...argv];
  const repo = takeOption(args, "--repo") ?? overrides.repo;
  const ctx = createContext({ ...overrides, repo });
  const [command] = args.splice(0, 1);
  const finish = () => {
    if (args.length) {
      throw new Error(`Unexpected arguments: ${args.join(" ")}\n${USAGE}`);
    }
    assertNodeVersion(ctx.repo);
  };

  if (command === "prepare") {
    const branch = takeOption(args, "--branch");
    const [bump] = args.splice(0, 1);

    if (!isOneOf(BUMPS, bump))
      throw new Error(`prepare needs major, minor or patch.\n${USAGE}`);
    if (branch !== undefined && !isOneOf(BRANCH_MODES, branch)) {
      throw new Error(`--branch must be rename or new.\n${USAGE}`);
    }
    finish();
    return prepare(ctx, bump, branch);
  }
  if (command === "check") {
    finish();
    return check(ctx);
  }
  if (command === "commit") {
    finish();
    return commit(ctx);
  }
  if (command === "pr") {
    const force = takeFlag(args, "--force");
    finish();
    return pr(ctx, force);
  }
  if (command === "tag") {
    const move = takeFlag(args, "--move");
    finish();
    return tag(ctx, move);
  }

  throw new Error(USAGE);
};

if (isMainModule(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    if (error instanceof DecisionNeeded) {
      process.stdout.write(`${error.message}\n`);
      process.exit(2);
    }
    process.stderr.write(`${getErrorMessage(error)}\n`);
    process.exit(1);
  }
}
