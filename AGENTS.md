# Agents guide

## Project overview

This project provides a collection of React components that wrap the Lightweight Charts by TradingView library, allowing developers to easily integrate financial charts into their React applications. The components are designed to be flexible and customizable, enabling users to create a wide variety of chart types and styles.

The project is an npm monorepo with npm workspaces and consists of two main parts: the examples app (`/examples`) and the library (`/lib`).
The examples app contains a React + MUI application that demonstrates how to use the components in various scenarios, while the library contains the actual React components that can be imported and used in other projects.

The library is published as an npm package and as a JSR package. The library is written in TypeScript and is designed to be tree-shakable. Most library React components are headless and do not render DOM elements. The chart wrapper components (`ChartWrapper`, `CustomChart`, `YieldCurveChart`, and `OptionsChart`) render container `<div>` elements, while the underlying chart and series APIs are exposed through refs and React context rather than being returned directly. The library does not include any styling or CSS.

The examples app is deployed and hosted on GitHub Pages as a static site.

## Environment

- Required runtime: Node 24 and npm >= 11.10.
- Use `.nvmrc`: `nvm use`.
- Prefer `npm ci --ignore-scripts` for clean agent/CI installs.

## Main working principles

- Make sure to update the documentation (`/lib` README and JSDoc comments) if you are adding new features or changing existing ones. Ensure all documentation is synced with the code and up-to-date.
- If you encounter docs that are outdated or incorrect, explicitly report it to developer or mention in the PR description.
- If applicable, update the changelog (`lib/CHANGELOG.md`) after making changes to `/lib` files with a brief description of the changes made. Keep changelog entries concise and informative, following the format of previous entries.
- If you are adding new features or making significant changes, consider adding new examples to the `/examples` app to demonstrate how to use the new functionality. Keep the examples clear and focused on showcasing the specific feature or change you have implemented. Follow the existing structure and style of the examples to maintain consistency across the project.
- Make sure that the relevant tests and checks pass. Prefer fast, targeted validation while iterating; use the fast validation matrix below, and reserve `npm run test:all` for full release confidence or broad cross-workspace changes. If you have added new features or made changes to existing ones, consider adding new tests to cover those changes and ensure that they work as expected. Follow the existing testing structure and conventions to maintain consistency across the project.
- Maintain security. Ensure that any new code you add does not introduce security vulnerabilities. Ensure that no extra code is getting into the production library bundle. Ensure that no secrets or sensitive information are included in the codebase or documentation.
- When writing React components, use functional components patterns and React Hooks. Avoid using class components. Follow the existing code style and conventions to maintain consistency across the project.
- Keep unit test coverage non-regressing. New code and test updates should maintain at least 95% coverage for lines, statements, functions, and branches in the affected workspace, and changes should not reduce existing coverage without an explicit reason documented in the PR description.
- Keep CI workflow bash minimal. If a GitHub workflow or composite action needs bash logic longer than two lines, move it into a dedicated script under `.github/scripts`. Pay special attention to scripts security and avoid using untrusted input in a way that could lead to command injection vulnerabilities. Always enforce `set -euo pipefail` in bash scripts to ensure that errors are properly handled and do not lead to unexpected behavior.
- Keep GitHub automation secure and maintainable. Prefer dedicated composite actions and standalone workflows for GitHub-specific validation instead of folding workflow checks into general lint/build composites.
- When editing `.github/**`, pin every third-party `uses:` reference to a full commit SHA. Keep the trailing version comment synced to the exact pinned ref, and for annotated tags prefer the peeled commit object that security validators expect.
- Scope GitHub workflows narrowly. Use generic path filters such as `.github/**` for GitHub-config-only workflows, prefer explicit minimal `permissions`, and avoid workflow-level write permissions unless every job truly needs them.
- Avoid `${{ }}` template expansion directly inside shell blocks when possible. Prefer passing values through scripts or environment variables; if a trusted GitHub/context value must stay inline in a `run:` block, add a concise inline `zizmor` suppression comment that explains the trust boundary.
- If you encounter conflicting instructions, always prefer local instructions in the codebase over general instructions. The hierarchy of instructions is as follows: 1) local instructions in the codebase, such as a local README or nested AGENTS.md, 2) the root README, `AGENTS.md`, or `.github/copilot-instructions.md`. If you are unsure about which instructions to follow, report it explicitly or mention it in the PR description.
- Use `npm` only, don't switch to `yarn` or `pnpm` without explicit instructions. If you encounter any issues with npm, report it explicitly or mention in the PR description.
- Keep the standalone sample sandbox dependency references in `examples/src/samples/*/sandbox/package.json` aligned with the current library major version. If `lib/package.json` is bumped to a new major, update each `lightweight-charts-react-components` dependency range in those sandbox manifests in the same change.
- When making a commit, ensure it follows the conventional commit format. Commit message requirements are defined in `commitlint.config.ts`. If you are unsure about the commit message format, refer to the commitlint documentation or report it explicitly or mention in the PR description.
- Prefer the following commit logic: one feature - one commit. If you are making multiple changes that are related to the same feature or issue, consider grouping them into a single commit to maintain a clear and concise commit history.
- Before marking new code as ready for review, run additional checks: `npm run build` to ensure the project builds, `npm run lint` to check for linting issues, and `npm run format` to ensure code is properly formatted. Address any issues that arise from these checks before submitting your code for review. Also run `npm run knip` to check for unused dependencies and remove them if any are found.
- When you need to name new component/variable/function, follow the existing naming conventions and patterns in the relevant part of the codebase. Use PascalCase for React components and camelCase for functions and variables. For folders, match the surrounding area instead of forcing a repo-wide rule: for example, library source folders use camelCase, while many example sample folders use PascalCase.
- Prefer strict TypeScript typing. Avoid using `any` unless absolutely necessary. If you need to use `any`, provide a clear justification in the code comments and consider adding a TODO to replace it with a more specific type in the future.

## Fast validation matrix

- Any .ts,.tsx file edit:
  - `npm run lint`
  - `npm run typecheck`
- Library source change:
  - `npm run test:unit -w lib -- --run`
  - `npm run build -w lib`
- Public API / package export change:
  - `npm run build -w lib`
  - `npm run check-exports -w lib`
- README/JSDoc change:
  - `npm run build`
  - `npm run check:jsdoc-links`
  - `npm run check:md-links`
- Examples UI change:
  - `npm run build -w examples`
  - `npm run test:e2e -w examples`
- Full release confidence:
  - `npm run build`
  - `npm run test:all`

## Other references

- [Contributing guidelines](CONTRIBUTING.md)
- Examples app has its own README with instructions on how to run it and add new examples: `/examples/README.md`
