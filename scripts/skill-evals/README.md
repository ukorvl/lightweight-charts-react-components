# Chart skill evaluation MVP

This is a reviewable pilot harness, with three realistic consumer tasks and draft
browser checks. It has separate task data, execution backends, scenario checkers,
and reporting. It does not claim the skill is effective until actual independent
agent runs have been compared under verified conditions.

## CI checks

```sh
npm run build -w lib
npm run test:skill-snippets
npm run test:skill-evals
```

Install Chromium first with `npx --no-install playwright install chromium`.
The snippet check extracts every `ts`/`tsx` fence from the skill body and references,
typechecks against the public package with strict settings, builds a consumer app,
and mounts/unmounts every component recipe in Chromium. Missing snippet registrations,
missing browser fixtures, compiler errors, and browser errors fail the check.
Evidence is written under `.cache/skill-evals/snippets/`.

Register module filenames in
[snippets.json](../../skills/lightweight-charts-react-components/evals/snippets.json)
in fence order, and provide sample props in
[snippet-fixtures.tsx](../../skills/lightweight-charts-react-components/evals/snippet-fixtures.tsx).
Local imports in the recipes are preserved. New TypeScript fences cannot silently
escape validation. Fixtures only provide inputs; they do not rewrite recipe code.

The **Skill code snippets** workflow runs for skill changes, including Markdown.
The **Skill evaluator calibration** workflow runs for non-Markdown skill/evaluator
changes. Both also run for library, dependency, and GitHub configuration changes,
and support manual dispatch. Both upload evidence, including failures.

`test:skill-evals` creates a fresh `calibration-ci-*` iteration and checks three
working integrations plus three deliberate defects. It uses no model credentials
and measures checker correctness. Agent effectiveness remains a separate paired
experiment using the backend protocol below; calibration results are excluded
from agent success rates.

## Start here

Use Node 24 and npm. The setup step downloads locked consumer dependencies into
an npm cache. Preparation then uses that cache offline and copies real installed
files into each consumer app; there are no links back to the repository.

```sh
nvm use
npm run build -w lib
npm run skill-evals -- setup
npm run skill-evals -- prepare --iteration pilot-1
npm run skill-evals -- list
```

Preparation refuses an existing iteration. The library artifact is the built
package's manifest and dist directory, copied to the consumer's vendor directory.
The committed consumer lockfile pins React 19.2.6, TypeScript 5.9.3, Vite 6.4.2 and
Lightweight Charts 5.2.1. If the library package changes, regenerate the fixture
lockfile against the new vendor manifest and rerun setup. No library source or
repository examples are provided. Both configurations receive the same public
README and declarations.

The generated directory is
`skills/lightweight-charts-react-components-workspace/pilot-1/`.
Each case has `repeat-1/with_skill/` and `repeat-1/without_skill/`, containing
`request.json`, `prompt.txt`, and `outputs/app/`. Only the treatment has a runtime
skill copy, excluding evaluation data and calibration answers. Requests contain
the task prompt but exclude expected outputs and checker definitions.

A new conversation and separate directory do not by themselves restrict filesystem
reads or automatic skill discovery. Use a runner that mounts only the current
run's app/skill inputs and supplies a clean context. The MVP command adapter does
not impose that isolation; an unverified runner produces an exploratory report
with `comparisonEligible: false`. Keep hidden evaluator data outside the runner's
mount. Use identical model settings, tools, network policy and budgets in both arms.

## Execute or import a run

Execution is an explicit per-run operation; preparation never launches models.
Configure an external executable through a JSON file:

```json
{ "command": "my-eval-runner", "args": [] }
```

The executable receives one [RunRequest](types.mts) JSON on stdin. It implements
a fresh agent session using the provided project directory, prompt and optional
skill path. It should write all agent tool/transcript events to stderr, and emit
one [Receipt](types.mts) JSON on stdout, with fields:

```json
{
  "status": "completed",
  "backend": "my-runner",
  "model": "reported-model-id",
  "reasoningEffort": "high",
  "settingsHash": null,
  "freshContext": true,
  "filesystemIsolation": "unverified",
  "totalTokens": null,
  "durationMs": null,
  "reason": "Filesystem confinement has not been independently verified."
}
```

The host measures elapsed time for command executions, retains stdout/stderr, and
terminates the process group at the shared limit. Unknown tokens remain null.
Use status `task_failed` for a completed agent attempt that cannot fulfill the
task, and `invalid` for a provider or runner failure. Only attest verified isolation
after checking the backend's filesystem/tool boundary; this receipt is a trusted
runner contract, not an agent self-assessment. Keep credentials outside config
files and transcripts.

`settingsHash` identifies the backend's actual model/tool/network configuration;
report its fingerprint when available, otherwise null. Only matching, recorded
configurations can establish a controlled comparison.

```sh
npm run skill-evals -- execute --iteration pilot-1 --case live-candles --arm with_skill --backend runner.json
npm run skill-evals -- verify --iteration pilot-1 --case live-candles --arm with_skill
```

Repeat for the other five run coordinates using fresh sessions. Existing starts
and receipts cannot be overwritten. Agent self-testing is allowed within the run;
the evaluator does not edit solutions before scoring.

For manual sessions, read `prompt.txt`, edit only that run's `outputs/app/src/`,
and import a backend receipt with actual metadata:

```sh
npm run skill-evals -- record --iteration pilot-1 --case live-candles --arm with_skill --receipt receipt.json
```

You can verify an output before importing metadata, but it cannot establish a valid
comparison. Any manual author hints invalidate the independent comparison.

## Verify the evaluator first

```sh
npm run skill-evals -- prepare --iteration calibration-1
npm run skill-evals -- calibrate --iteration calibration-1
```

This runs six Chromium consumer checks: three known working integrations and three
deliberate defects. Calibration requires each working integration to pass and each
defect to fail a scenario assertion. These artifacts are labeled calibration and
excluded from agent success rates. Calibration refuses ordinary iteration names.

The current defects keep details on the initial snapshot, fail to shift the historical
viewport, and put volume across the whole pane. Calibration establishes those
checker sensitivities; it does not prove every possible failure is detectable.
The [live calibration](calibration/live-candles.tsx),
[history calibration](calibration/history.tsx), and
[volume calibration](calibration/volume.tsx) are hidden evaluator inputs.

Checks compile with strict evaluator-owned settings, build the app, and exercise
real Lightweight Charts in Chromium. Native observation forwards calls to the
installed library. It observes data, panes, range and scales rather than requiring
specific agent variable names. Public range setters establish deterministic scroll
positions and fire the real range-change events; hover uses pointer input and feed,
symbol, retry and visibility actions use supplied product controls.

The host owns typed props and a JSON-formatted OHLC output solely to make values
unambiguous. The agent implements the chart and details selection. This pilot
assesses those behaviors; it does not assess legend visual design.

Each verification preserves a timestamped evidence pass under `checks/`, including
compiler/build logs, assertions, a screenshot and a Playwright trace. Protected
fixture changes fail a correctness gate. Grading uses a separate staging copy with
the original dependencies and build configuration. Assertions remain draft until
the first real pilot outputs have been reviewed.

## Report and extend

```sh
npm run skill-evals -- report --iteration pilot-1
```

Review `report.md` and `benchmark.json` alongside the actual apps. The harness creates
`feedback.json` with explicitly pending human reviews;
subsequent reports preserve your feedback. Production Knip excludes evaluator tools
and consumer fixtures; lint, typecheck and calibration still validate them.
The report retains missing metadata and missing/invalid runs, excludes calibration,
uses equal case weights, records raw timing/token values and pairs wins/losses/ties.
A quick failure is never treated as
an efficiency win. Draft checks, incomplete matrices, mixed evaluator versions or
unverified execution metadata prevent a comparison claim. Human review of comments
and architecture remains required; this MVP does not automate a subjective judge.

Extension points:

- Add realistic prompts and expected outcomes to
  [evals.json](../../skills/lightweight-charts-react-components/evals/evals.json),
  and inputs under its `files/` directory.
- Add a checker conforming to `ScenarioChecker` in [browser.mts](browser.mts) and
  register it in [checks/index.mts](checks/index.mts). Assert outcomes, allowing
  supported alternative implementations. Calibrate it against working and broken
  solutions and add script tests.
- Implement a new `Backend` adapter or an external runner using the JSON protocol.
  The CLI does not depend on a particular agent SDK.
- Inspect the first six real outputs before refining assertions. Freeze the suite
  only after checker calibration and review; prepare a new iteration with
  `--repetitions 3` for the 18-run comparison.
- Snapshot the previous skill before revision and use a separate paired iteration.
  The current MVP supports skill/no-skill arms; previous-skill and automatic-selection
  experiments are follow-up extensions.

Generated workspaces and dependency caches are ignored by normal repository checks.
Run `npm run lint`, `npm run typecheck`, `npm run test:unit:scripts`, and
`npm run format` after extending the harness. Run `npm run build` and `npm run knip`
when changing dependencies or script entrypoints.
