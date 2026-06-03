---
name: release-manager
description: "Prepare or finalize semver releases for this repository. Use when Codex needs to create or resume a `release-vX.Y.Z` branch from `main`, bump the library version by `major`, `minor`, or `patch`, verify `lib/package.json`, `lib/jsr.json`, `lib/src/version.ts`, the library entry in `package-lock.json`, and the standalone sandbox dependency references in `examples/src/samples/*/sandbox/package.json` stay in sync, update release-facing docs such as `lib/CHANGELOG.md`, `MIGRATION.md`, `SECURITY.md`, and READMEs when needed, run release validation, create commit `chore: vX.Y.Z`, open a release PR, and only after maintainer confirmation create or push annotated tag `vX.Y.Z` from the reviewed release commit."
---

# Release Manager

Use this skill to prepare a local release branch and the git artifacts needed before a maintainer runs the repository's GitHub `Release` workflow.

## Inputs

Collect these inputs from the request or infer them from context:

- `mode`: `prepare-release-branch` or `finalize-release-tag`; default to `prepare-release-branch`
- `bump`: `major`, `minor`, or `patch`
- `repo_path`: repository root; default the current workspace if it contains `lib/package.json`
- `base_branch`: default `main`
- `remote`: default `origin`
- `push_and_pr`: optional; only for `prepare-release-branch`
- `release_ref`: required for `finalize-release-tag` unless the user clearly identifies the reviewed commit or merged `main` HEAD that should be tagged
- `push_tag`: optional; only for `finalize-release-tag` after explicit maintainer confirmation

If the worktree already contains unrelated edits, pause and ask before continuing. Release prep should start from a clean tree so the release commit does not absorb unrelated work.

## Modes

Choose the mode first and keep the semantics explicit.

- `prepare-release-branch`: create or resume the release branch, bump files, update docs, validate, commit, and optionally open the PR. Do not create or push the release tag in this mode.
- `finalize-release-tag`: work only from the reviewed release commit after merge approval. Create the annotated tag on that reviewed commit, push it only when the maintainer confirms, and then let the maintainer run the GitHub `Release` workflow on that tag.

## Workflow

1. Read `references/release-checklist.md` before changing files if the repository layout looks unfamiliar.
2. Use the repo's required environment: `nvm use` for Node 24, and `npm` only.
3. If `mode` is `prepare-release-branch`, run `scripts/prepare_release.sh --repo <repo_path> --bump <bump>`.
   - It computes the target version from `lib/package.json`.
   - It updates `main` from `origin/main` unless `--skip-fetch` is needed.
   - It creates or resumes `release-vX.Y.Z`.
   - It runs the repository version bump entrypoint only if the release branch still has the base version.
   - It verifies all version touchpoints match after the branch switch and bump, including the library entry in `package-lock.json` and the standalone sandbox dependency major references.
4. If `mode` is `prepare-release-branch`, update release documentation.
   - Always update `lib/CHANGELOG.md`.
   - Update `MIGRATION.md` for breaking changes or new upgrade steps.
   - Update `SECURITY.md` when supported major lines change.
   - Inspect other markdown files such as `README.md`, `lib/README.md`, `examples/README.md`, and `CONTRIBUTING.md` when the release changes public API, install guidance, or release workflow notes.
5. If `mode` is `prepare-release-branch`, validate the release branch.
   - Always run `scripts/check_versions_in_sync.sh --repo <repo_path>`.
   - Choose the rest of the checks from `references/release-checklist.md` based on what changed.
   - Before handing off a ready release branch, prefer the repo-level quality gates if feasible: `npm run build`, `npm run lint`, `npm run format`, and `npm run knip`.
6. If `mode` is `prepare-release-branch`, create the release commit.
   - Stage only release-related files.
   - Create commit `chore: vX.Y.Z`.
   - If the user wants the review flow, push `release-vX.Y.Z` and open a PR to `main`.
   - Mention that the repository posts release-note previews on PRs whose branch name starts with `release`.
   - Do not create or push the release tag in this mode.
7. If `mode` is `finalize-release-tag`, work from the reviewed release commit only.
   - Confirm the exact commit or ref to tag. Prefer the merged commit on `main` or another reviewed ref explicitly approved by the maintainer.
   - Verify the tag does not already exist locally or on the remote.
   - Create annotated tag `vX.Y.Z` with message `release vX.Y.Z` on that reviewed commit.
   - Push the tag only when the maintainer confirms.
   - Run or trigger the GitHub `Release` workflow on that tag only when the user explicitly asks.

## Files To Read On Demand

- `references/release-checklist.md` for repo-specific release touchpoints, docs rules, and validation commands
- `scripts/prepare_release.sh` for branch setup and version bump orchestration
- `scripts/check_versions_in_sync.sh` for the local equivalent of `.github/actions/check-versions-in-sync`

## Guardrails

- Use `npm`, not `pnpm` or `yarn`.
- Do not rewrite or discard unrelated user changes.
- Prefer `git switch` and `git pull --ff-only`; avoid destructive resets.
- If the release branch already exists with the target version, reuse it instead of bumping twice.
- Never create or push a release tag from an unreviewed local-only release branch.
- Tag only after PR review and maintainer confirmation of the exact commit being released.
- If documentation updates are unclear, inspect the source changes and existing changelog style before writing notes.
- If a new major release changes supported lines, make sure `SECURITY.md` reflects the new support policy.
- If the release crosses a major version boundary, update every `examples/src/samples/*/sandbox/package.json` reference to `lightweight-charts-react-components` so the standalone sandboxes track the new library major.
