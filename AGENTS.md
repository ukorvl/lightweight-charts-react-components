# Agents guide

## Project overview

This project provides a collection of React components that wrap the Lightweight Charts by TradingView library, allowing developers to easily integrate financial charts into their React applications. The components are designed to be flexible and customizable, enabling users to create a wide variety of chart types and styles.

The project is an npm monorepo with npm workspaces and consists of two main parts: the examples app (`examples`) and the library (`lib`).
The examples app contains a React + MUI application that demonstrates how to use the components in various scenarios, while the library contains the actual React components that can be imported and used in other projects.

The library is published as an npm package and as a JSR package. The library is written in TypeScript and is designed to be tree-shakable. Most library React components are headless and do not render DOM elements. The chart wrapper components (`ChartWrapper`, `CustomChart`, `YieldCurveChart`, and `OptionsChart`) render container `<div>` elements, while the underlying chart and series APIs are exposed through refs and React context rather than being returned directly. The library does not include any styling or CSS.

The examples app is deployed and hosted on GitHub Pages as a static site.

## Environment

- Required runtime: Node 24 and npm >= 11.10.
- Use `.nvmrc`: `nvm use`.
- Prefer `npm ci --ignore-scripts` for clean agent/CI installs.

## Main working principles

- Make sure to update the documentation (`lib/README.md` and JSDoc comments) if you are adding new features or changing existing ones in the library. Ensure all documentation is synced with the code and up-to-date. Pay special attwention to JSDoc code snippets, as they can become outdated easily.
- If you encounter docs that are outdated or incorrect, explicitly report it to developer or mention in the PR description.
- If applicable (when some public user-facing interface or behavior changes), update the changelog (`lib/CHANGELOG.md`) after making changes to `lib` files with a brief description of the changes made. Keep changelog entries concise and informative, following the format of previous entries. Always place new entries under the "Unreleased" section and update the version and date only when preparing for a release.
- If you are adding new features or making significant changes, consider adding new examples to the `examples` app to demonstrate how to use the new functionality. Keep the examples clear and focused on showcasing the specific feature or change you have implemented. Follow the existing structure and style of the examples to maintain consistency across the project.
- Make sure that the relevant tests and checks pass. Treat the validation policy and matrix below as the single source of truth: run the minimum required checks for the touched area while iterating, and before review rerun every entry marked "Required before review" for each affected area. Reserve `npm run test:all` for full release confidence or broad cross-workspace changes.
- Maintain security. Ensure that any new code you add does not introduce security vulnerabilities. Ensure that no extra code is getting into the production library bundle. Ensure that no secrets or sensitive information are included in the codebase or documentation.
- When writing React components, use functional components patterns and React Hooks. Avoid using class components. Follow the existing code style and conventions to maintain consistency across the project.
- Keep library unit test coverage non-regressing. The `lib` workspace enforces 95% global thresholds for lines, statements, functions, and branches via `npm run test:unit -w lib -- --run`; do not reduce those thresholds or merge changes that fail them without an explicit maintainer decision documented in the PR description. For the `examples` workspace, add or update tests for affected behavior, but do not assume a numeric coverage gate unless one is added there.
- Keep GitHub workflow bash minimal. If a `run:` block grows beyond a couple of straightforward commands, or introduces conditionals, loops, reusable logic, complex quoting, or security-sensitive interpolation, move it into a dedicated script under `.github/scripts`. Pay special attention to script security and avoid using untrusted input in a way that could lead to command injection vulnerabilities.
- Keep GitHub automation secure and maintainable. Prefer dedicated composite actions and standalone workflows for GitHub-specific validation instead of folding workflow checks into general lint/build composites.
- When editing `.github/**`, pin every third-party `uses:` reference to a full commit SHA. Keep the trailing version comment synced to the exact pinned ref, and for annotated tags prefer the peeled commit object that security validators expect.
- Scope GitHub workflows narrowly. Use generic path filters such as `.github/**` for GitHub-config-only workflows, prefer explicit minimal `permissions`, and avoid workflow-level write permissions unless every job truly needs them.
- Avoid `${{ }}` template expansion directly inside shell blocks when possible. Prefer passing values through scripts or environment variables; if a trusted GitHub/context value must stay inline in a `run:` block, add a concise inline `zizmor` suppression comment that explains the trust boundary.
- If you encounter conflicting instructions, follow this precedence order: 1) the nearest nested `AGENTS.md`, 2) the nearest task-specific README or instruction file in the same area, 3) the repository root `AGENTS.md`, 4) the repository root `README.md`, 5) `.github/copilot-instructions.md`. If two sources at the same level conflict, or the applicable scope is unclear, stop and report the ambiguity instead of guessing.
- Use `npm` only, don't switch to `yarn` or `pnpm` without explicit instructions. If you encounter any issues with npm, report it explicitly or mention in the PR description.
- Keep `lib` peer dependency ranges intentional and consumer-friendly. When touching package metadata or adopting new ecosystem APIs, verify peer deps reflect the minimum supported stable versions and do not unnecessarily exclude compatible app versions.
- Keep the standalone sample sandbox dependency references in `examples/src/samples/*/sandbox/package.json` aligned with the current library major version. If `lib/package.json` is bumped to a new major, update each `lightweight-charts-react-components` dependency range in those sandbox manifests in the same change.
- Keep `lightweight-charts` version consistent across the library, `lib/jsr.json` and sandboxes code in examples. If you need to update the `lightweight-charts` version, make sure to update it in both the library `lib/jsr.json` and the sandboxes to avoid compatibility issues.
- When designing or refactoring wrapper APIs around `lightweight-charts`, prefer thin adapters and direct reuse of upstream types over duplicating or reshaping core library interfaces. Keep wrapper-owned abstractions minimal, expose upstream option and event types where practical, and isolate unavoidable compatibility glue to small adapter layers so future `lightweight-charts` upgrades usually require version bumps and targeted validation rather than broad wrapper rewrites.
- When making a commit, ensure it follows the conventional commit format. Commit message requirements are defined in `commitlint.config.ts`. If you are unsure about the commit message format, refer to the commitlint documentation or report it explicitly or mention in the PR description.
- Prefer the following commit logic: one feature - one commit. If you are making multiple changes that are related to the same feature or issue, consider grouping them into a single commit to maintain a clear and concise commit history.
- Before marking work as ready for review, run the "Required before review" commands from the validation matrix for every affected area. Run `npm run format` when you changed files covered by Prettier, and run `npm run knip` when dependency declarations, workspace wiring, package exports, or script entrypoints changed.
- When you need to name new component/variable/function, follow the existing naming conventions and patterns in the relevant part of the codebase. Use PascalCase for React components and camelCase for functions and variables. For folders, match the surrounding area instead of forcing a repo-wide rule: for example, library source folders use camelCase, while many example sample folders use PascalCase.
- Prefer strict TypeScript typing. Avoid using `any` unless absolutely necessary. If you need to use `any`, provide a clear justification in the code comments and consider adding a TODO to replace it with a more specific type in the future.
- If you add a new script under `scripts` or `.github/scripts`, add a proper comment on top of the file. Specify `#!/usr/bin/env node` or `#!/bin/bash` as appropriate, and include a concise description of the script's purpose, its expected inputs and outputs, and any important implementation details or edge cases that future maintainers should be aware of.
- Always enforce `set -euo pipefail` in bash scripts to ensure that errors are properly handled and do not lead to unexpected behavior.
- Do not commit absolute local paths into repository content. Use repository-relative paths in source files, docs, comments, examples, workflow messages, and generated fixtures checked into the repo.

## Validation policy

- Start with the smallest set of checks that covers the files you touched.
- If more than one row below applies, run the union of their commands.
- "Required while iterating" is the default inner loop. "Required before review" is the bar before handing work off.
- If a command is flaky or blocked by unrelated repo state, report that clearly in your handoff instead of silently skipping it.
- Use `npm run test:all` only for release confidence or changes that genuinely span both workspaces end to end.

## Validation matrix

| Change type                                                                 | Required while iterating                                      | Required before review                                                     |
| --------------------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Any `.ts`, `.tsx`, or `.mts` file edit                                      | `npm run lint`<br>`npm run typecheck`                         | `npm run lint`<br>`npm run typecheck`                                      |
| Library source change (`lib/src/**`)                                        | `npm run test:unit -w lib -- --run`<br>`npm run build -w lib` | `npm run test:unit -w lib -- --run`<br>`npm run build -w lib`              |
| Public API or package export change                                         | `npm run build -w lib`                                        | `npm run build -w lib`<br>`npm run check-exports -w lib`                   |
| README or JSDoc change                                                      | `npm run build`                                               | `npm run build`<br>`npm run check:jsdoc-links`<br>`npm run check:md-links` |
| Examples UI or runtime behavior change                                      | `npm run build -w examples`                                   | `npm run build -w examples`<br>`npm run test:e2e -w examples`              |
| Examples business-logic or testable state change                            | `npm run test:unit -w examples`                               | `npm run test:unit -w examples`                                            |
| Dependency, workspace wiring, package metadata, or script entrypoint change | `npm run build`                                               | `npm run build`<br>`npm run knip`<br>`npm run format`                      |
| Full release confidence                                                     | n/a                                                           | `npm run build`<br>`npm run test:all`                                      |

## Other references

- [Contributing guidelines](CONTRIBUTING.md)
- Examples app has its own README with instructions on how to run it and add new examples: `examples/README.md`
