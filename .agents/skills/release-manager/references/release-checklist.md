# Release Checklist

## Repo touchpoints

- Runtime: Node 24 from `.nvmrc`
- Package manager: `npm` only
- Version bump entrypoint: `npm run version -- <major|minor|patch>`
- Version-related files normally changed by a release:
  - `lib/package.json`
  - `lib/jsr.json`
  - `lib/src/version.ts`
  - `package-lock.json`
  - `examples/src/samples/*/sandbox/package.json` when the library major changes; keep the `lightweight-charts-react-components` dependency on the current major line
- Release workflows to mirror locally:
  - `.github/actions/check-versions-in-sync/action.yaml`
  - `.github/workflows/check-changelog.yaml`
  - `.github/workflows/release.yaml`
  - `.github/workflows/release-notes.yaml`

## Documentation checklist

- `lib/CHANGELOG.md`: always add `## [X.Y.Z] - YYYY-MM-DD` and move user-facing notes out of `Unreleased`
- `MIGRATION.md`: update when consumers need upgrade steps, especially for breaking changes
- `SECURITY.md`: update the supported versions table when the newest supported major line changes
- `docs/current/` and `docs/versions/`: make an explicit docs-line decision for the native `/docs` app
  - reuse an existing released docs line when the package release does not need distinct docs
  - create a new `docs/versions/vX.Y/` snapshot only when the maintained docs subset should change
  - update `docs/versions/manifest.json` whenever the supported docs lines or package-version mappings change
  - keep released docs as source/data snapshots only
- `README.md` and `lib/README.md`: update when install guidance, usage examples, or public API docs changed
- `examples/README.md`: update only if example authoring or running instructions changed
- `CONTRIBUTING.md`: update only if the release workflow itself changed

## Validation matrix

- Always:
  - `bash .agents/skills/release-manager/scripts/check_versions_in_sync.sh --repo <repo_path>`
  - `npm run build -w lib`
  - `npm run test:unit -w lib -- --run`
- Public API or package export changes:
  - `npm run check-exports -w lib`
- Markdown or JSDoc changes:
  - `npm run check:jsdoc-links`
  - `npm run check:md-links`
- Examples app changes:
  - `npm run build -w examples`
  - `npm run test:e2e -w examples`
- Final maintainer confidence before handoff:
  - `npm run build`
  - `npm run lint`
  - `npm run format`
  - `npm run knip`
  - `npm run test:all`

## Git flow

- Recommended order:
  - create or resume `release-vX.Y.Z`
  - commit `chore: vX.Y.Z`
  - open PR to `main`
  - review and merge
  - identify the reviewed commit to release
  - create annotated tag `vX.Y.Z` on that reviewed commit
  - push the tag
  - run the GitHub `Release` workflow on that tag
- Ensure `main` is up to date with `origin/main` before branch prep or tag finalization
- Keep the release commit message exactly `chore: vX.Y.Z`
- Never create or push the release tag from an unreviewed local-only release branch
- Check for existing tags before creating a new one:
  - local: `git rev-parse -q --verify refs/tags/vX.Y.Z`
  - remote: `git ls-remote --tags origin vX.Y.Z`
- Push and open a PR to `main` only when the user asks for that extra step
- Push the tag only after the maintainer confirms the reviewed commit that should be released
- Do not run publish commands or the GitHub `Release` workflow unless the user explicitly asks
