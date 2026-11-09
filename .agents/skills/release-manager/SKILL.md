---
name: release-manager
description: Release lightweight-charts-react-components end to end. Invoke as `/release-manager <major|minor|patch>`; with no argument on a `release-vX.Y.Z` branch it resumes that release.
argument-hint: "<major|minor|patch>"
---

# Release Manager

Drive every step through `node scripts/release.mts <command>` from the repo root on Node 24 (`nvm use`), npm only. Commands are idempotent: after any fix, rerun the same command. Exit 1 is an error: do what stderr says. Exit 2 is a decision: ask the user with the options printed on stdout, then rerun with the chosen flag.

Invoking the skill authorizes steps 1–6 (branch, files, commit, push, PR, tag push). Steps 7–8 publish and merge: ask first.

## Input

`$ARGUMENTS` is `major`, `minor` or `patch`. If it is empty and the current branch is `release-vX.Y.Z`, resume: the bump is whatever turns `git show origin/main:lib/package.json` into X.Y.Z. Otherwise ask for the bump; do not infer it from commits.

## Steps

1. `prepare <bump>`: creates `release-vX.Y.Z` from `origin/main` or resumes it, bumps version files via `npm run version` (`lib/package.json`, `lib/jsr.json`, `lib/src/version.ts`, `package-lock.json`, pinned links in `lib/README.md`), moves `[Unreleased]` into `## [X.Y.Z] - <today>`, pins sandbox deps to `^MAJOR`, and runs the version sync check.
   - On any other branch it exits 2. `--branch rename` turns that branch into the release branch, so its commits ship in this release. `--branch new` branches from `origin/main` and leaves it alone.
   - Empty `[Unreleased]`: it prints the commits since the last tag. Write user-facing entries under `[Unreleased]` in the existing style (`### Added` / `### Changed` / `### Fixed`, short lowercase bullets, backticked API names), then rerun.
   - Branch behind `origin/main` with its own commits: ask the user whether to merge or rebase, do it, rerun.
2. Review docs; edit only what the release needs:
   - Read the printed changelog section and tighten wording. Never edit past releases.
   - Major: upgrade steps in `MIGRATION.md`, the supported versions table in `SECURITY.md`, and the library row of the compatibility table in `skills/lightweight-charts-react-components/SKILL.md`. The sync check fails until that range covers the new major; verify recipes with `npm run check:skill-recipes`.
   - Changed peer or engine ranges: the matching rows of that table.
   - Minor or patch: keep the skill's reference versions. They are the tested baseline, and only the ranges must cover the release.
   - `lib/README.md`: prose only when install or usage changed; pinned links are already done.
3. `check` (several minutes, run it in the background): versions, format, lint, typecheck, lib unit tests with the coverage gate, build, jsdoc and md links, knip, plus skill recipes when `skills/` changed. Fix failures and rerun. If `md links` fails only on external 5xx or timeouts, it is flaky: note it for the user and continue.
4. `commit`: one commit with the exact message `chore: vX.Y.Z`. It refuses non-release files: commit those first as their own conventional commit, or stash them. It also refuses while `[Unreleased]` has entries, for example a fix added during validation; rerun `prepare`, which merges them into `[X.Y.Z]`. Rerunning after later edits amends the same commit.
5. `pr`: pushes the branch and opens the PR `chore: vX.Y.Z` to `main` with the changelog section as body, or reuses the open one and refreshes its body from the current changelog. The `release*` branch name triggers the release-notes preview comment. After an amend it exits 2: confirm, then rerun with `--force` (force-with-lease).
6. `tag`: creates and pushes annotated tag `vX.Y.Z` (message `release vX.Y.Z`) on the pushed release commit. Releases are tagged and published from the branch before merge. If the tag points at an older commit, it exits 2: confirm, then rerun with `--move`, which is refused once the version is on npm.
7. Publish, after the user says yes (npm, JSR, GitHub release, examples deploy):
   - `gh workflow run release.yaml --ref vX.Y.Z`. Add `-f dry-run=true` for a rehearsal. It must run on the tag; a branch ref fails the semver check.
   - `gh run list --workflow release.yaml --branch vX.Y.Z --limit 1 --json databaseId,url`, then `gh run watch <id> --exit-status` in the background.
   - Failed before the `Release` job: nothing is published. For flakes, run `gh run rerun <id> --failed`. For real problems, fix on the branch, then `commit`, `pr --force`, `tag --move`, and dispatch again.
   - Failed after `npm publish` ran: that version is final. Do not move the tag; release a new patch.
8. Merge, after the Release run succeeds and the user says yes: `gh pr merge <number> --merge`. Use a merge commit, never squash or rebase, so the tagged commit lands on `main` unchanged. Then `git switch main && git pull --ff-only && git branch -d release-vX.Y.Z`; the remote branch is deleted on merge.

## Finish

Report the version, PR URL, tag, Release run URL and result, and any skipped or flaky check.
