# Release Checklist

## Repo touchpoints

- Runtime: Node 24 from `.nvmrc`
- Package manager: `npm` only
- Version bump entrypoint: `npm run version -- <major|minor|patch>`
- Version files that must match:
  - `lib/package.json`
  - `lib/jsr.json`
  - `lib/src/version.ts`
- Release workflows to mirror locally:
  - `.github/actions/check-versions-in-sync/action.yaml`
  - `.github/workflows/check-changelog.yaml`
  - `.github/workflows/release.yaml`
  - `.github/workflows/release-notes.yaml`

## Documentation checklist

- `lib/CHANGELOG.md`: always add `## [X.Y.Z] - YYYY-MM-DD` and move user-facing notes out of `Unreleased`
- `MIGRATION.md`: update when consumers need upgrade steps, especially for breaking changes
- `SECURITY.md`: update the supported versions table when the newest supported major line changes
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

- Ensure `main` is up to date with `origin/main`
- Create or resume `release-vX.Y.Z`
- Keep the release commit message exactly `chore: vX.Y.Z`
- Create the annotated tag with `git tag -a vX.Y.Z -m "release vX.Y.Z"`
- Check for existing tags before creating a new one:
  - local: `git rev-parse -q --verify refs/tags/vX.Y.Z`
  - remote: `git ls-remote --tags origin vX.Y.Z`
- Push and open a PR to `main` only when the user asks for that extra step
- Do not run publish commands or the GitHub `Release` workflow unless the user explicitly asks
