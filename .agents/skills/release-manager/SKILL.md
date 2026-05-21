---
name: release-manager
description: "Prepare semver releases for this repository. Use when Codex needs to create or resume a `release-vX.Y.Z` branch from `main`, bump the library version by `major`, `minor`, or `patch`, verify `lib/package.json`, `lib/jsr.json`, and `lib/src/version.ts` stay in sync, update release-facing docs such as `lib/CHANGELOG.md`, `MIGRATION.md`, `SECURITY.md`, and READMEs when needed, run release validation, create commit `chore: vX.Y.Z`, and add annotated tag `vX.Y.Z`."
---

# Release Manager

Use this skill to prepare a local release branch and the git artifacts needed before a maintainer runs the repository's GitHub `Release` workflow.

## Inputs`

Collect these inputs from the request or infer them from context:

- `bump`: `major`, `minor`, or `patch`
- `repo_path`: repository root; default the current workspace if it contains `lib/package.json`
- `base_branch`: default `main`
- `remote`: default `origin`
- `push_and_pr`: optional; only if the user wants the release branch pushed and a PR opened after local prep

If the worktree already contains unrelated edits, pause and ask before continuing. Release prep should start from a clean tree so the release commit does not absorb unrelated work.

## Workflow

1. Read `references/release-checklist.md` before changing files if the repository layout looks unfamiliar.
2. Use the repo's required environment: `nvm use` for Node 24, and `npm` only.
3. Run `scripts/prepare_release.sh --repo <repo_path> --bump <bump>`.
   - It computes the target version from `lib/package.json`.
   - It updates `main` from `origin/main` unless `--skip-fetch` is needed.
   - It creates or resumes `release-vX.Y.Z`.
   - It runs the repository version bump entrypoint only if the release branch still has the base version.
   - It verifies the version trio matches after the branch switch and bump.
4. Update release documentation.
   - Always update `lib/CHANGELOG.md`.
   - Update `MIGRATION.md` for breaking changes or new upgrade steps.
   - Update `SECURITY.md` when supported major lines change.
   - Inspect other markdown files such as `README.md`, `lib/README.md`, `examples/README.md`, and `CONTRIBUTING.md` when the release changes public API, install guidance, or release workflow notes.
5. Validate the release branch.
   - Always run `scripts/check_versions_in_sync.sh --repo <repo_path>`.
   - Choose the rest of the checks from `references/release-checklist.md` based on what changed.
   - Before handing off a ready release branch, prefer the repo-level quality gates if feasible: `npm run build`, `npm run lint`, `npm run format`, and `npm run knip`.
6. Create the git artifacts.
   - Stage only release-related files.
   - Create commit `chore: vX.Y.Z`.
   - Create annotated tag `vX.Y.Z` with message `release vX.Y.Z`.
   - Never recreate or move an existing release tag. Stop and report if the tag already exists locally or on the remote.
7. Optional GitHub flow.
   - If the user wants the full review flow, push `release-vX.Y.Z` and open a PR to `main`.
   - Mention that the repository posts release-note previews on PRs whose branch name starts with `release`.
   - Do not publish or run the GitHub `Release` workflow unless the user explicitly asks.

## Files To Read On Demand

- `references/release-checklist.md` for repo-specific release touchpoints, docs rules, and validation commands
- `scripts/prepare_release.sh` for branch setup and version bump orchestration
- `scripts/check_versions_in_sync.sh` for the local equivalent of `.github/actions/check-versions-in-sync`

## Guardrails

- Use `npm`, not `pnpm` or `yarn`.
- Do not rewrite or discard unrelated user changes.
- Prefer `git switch` and `git pull --ff-only`; avoid destructive resets.
- If the release branch already exists with the target version, reuse it instead of bumping twice.
- If documentation updates are unclear, inspect the source changes and existing changelog style before writing notes.
- If a new major release changes supported lines, make sure `SECURITY.md` reflects the new support policy.
