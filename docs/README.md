# Docs Source

This directory is the source of truth for the native `/docs` section inside the examples
app.

## Structure

- `current/`
  - editable source for the unreleased docs preview
  - used for local development only
- `versions/`
  - immutable source/data snapshots for released docs lines
  - each line lives in its own folder such as `v2.3/`
  - `manifest.json` is the machine-readable list of supported docs lines
- `topic-registry.json`
  - defines the stable conceptual topic routes
  - maps each topic to the curated public exports rendered in the API section

## Authoring model

- Guides are written as MDX under `topics/`.
- Curated code examples live in tested `.tsx` snippets under `snippets/`.
- API reference is generated from public TypeScript exports only via `TypeDoc -> JSON ->
custom React renderer`.
- Generated payloads should be derived from this directory by `npm run generate:docs`
  rather than authored inside the examples app directly.

## Versioning rules

- Unversioned routes such as `/docs/chart` resolve to the latest released docs line in
  production.
- In local development, unversioned routes resolve to the `current/` preview line.
- Versioned routes such as `/docs/v2.2/chart` always load the explicit released line.
- If a stable topic exists in the registry but is absent from a released line, the app
  keeps the same route and shows a friendly “not available in this version” state.

## Snapshot policy

- Released docs are stored as source/data snapshots only. Do not commit built site
  artifacts.
- Snapshot creation is an explicit developer decision. Do not assume every release needs a
  new docs line.
- Patch releases normally reuse an existing docs line.
- Minor releases may also reuse an existing docs line when the docs surface did not change
  in a meaningful way.
- Only versions listed in `docs/versions/manifest.json` should be generated and shipped.

## Updating a released docs line

1. Decide whether the new package version should reuse an existing docs line or create a
   new snapshot line.
2. If creating a new line, copy the relevant source from `current/` into a new
   `versions/vX.Y/` directory and edit it intentionally for that line.
3. Update `docs/versions/manifest.json` with the supported docs subset and
   `packageVersionToDocsLine` mapping.
4. Run `npm run generate:docs`.
5. Run `npm run test:docs -- --run`.
6. For examples app changes, also run `npm run build -w examples` and
   `npm run test:e2e -w examples`.
