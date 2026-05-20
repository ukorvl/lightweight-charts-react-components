# Examples Application

## Description

This workspace contains the examples application for
[`lightweight-charts-react-components`](../lib/README.md). It is a Vite + React + MUI
site that showcases the library in realistic scenarios and is deployed as a static
GitHub Pages app.

Use this workspace when you want to:

- preview components in a real UI instead of isolated unit tests
- document new library capabilities with visible, working samples
- provide standalone sample sandboxes for GitHub, CodeSandbox, and StackBlitz
- verify the public demo with Playwright and Lighthouse before releases

## Table of Contents

- [Examples Application](#examples-application)
  - [Description](#description)
  - [Table of Contents](#table-of-contents)
  - [Local Development](#local-development)
  - [Project Structure](#project-structure)
  - [Adding a New Sample](#adding-a-new-sample)
  - [Testing](#testing)
  - [Deployment](#deployment)

## Local Development

Install dependencies from the repository root:

```bash
npm install
```

For day-to-day library work, run the root dev command so the library and examples stay in
sync while you edit both workspaces:

```bash
npm run dev
```

If you only need to work on the examples app itself, use the workspace scripts directly:

```bash
npm run dev -w examples
npm run build -w examples
npm run preview -w examples
```

The examples app uses the local library workspace through `file:../lib`, so changes in the
library are reflected best when the root dev workflow is running.

## Project Structure

```text
examples/
├── public/                 Static assets copied as-is into the final build
├── scripts/                Workspace-specific helper scripts
├── src/
│   ├── common/             Shared theme, utilities, chart helpers, and app-wide hooks
│   ├── pages/              Route-level pages such as the examples index and terminal page
│   ├── samples/            Individual showcase examples grouped by feature
│   ├── terminal/           Terminal-specific UI and tools
│   ├── ui/                 Reusable application shell and presentation components
│   ├── App.tsx             Router and route registration
│   └── samples.ts          External links metadata for each sample card
├── tests/e2e/              Playwright coverage for the public app and sample sandboxes
├── playwright.config.ts    Browser test setup and local dev server integration
└── vite.config.ts          Build, PWA, sitemap, and static deployment configuration
```

Within the gallery, `src/pages/index/Contents.tsx` controls which samples appear and in what
order. Each sample is usually wrapped in `ChartWidgetCard`, which provides the shared card
layout, action links, and error boundary behavior.

## Adding a New Sample

1. Create a new folder in `src/samples/` using the local examples naming pattern, which is
   typically `PascalCase` for sample folders.
2. Add the main sample component, for example `src/samples/MySample/MySample.tsx`, and keep
   any sample-specific stores, hooks, or helpers next to it.
3. Render the example inside `ChartWidgetCard` so it matches the rest of the gallery.
4. Register the sample links in `src/samples.ts`. This controls the GitHub, CodeSandbox, and
   StackBlitz actions shown in the card header.
5. Add the sample component to `src/pages/index/Contents.tsx` so it appears on the main page.
6. If the sample should be runnable in isolation, add a `sandbox/` subfolder with its own
   minimal Vite app. Sandboxes with a `package.json` are automatically picked up by the
   sandbox Playwright test.

As a rule of thumb, a sample should demonstrate one library capability clearly rather than
trying to cover many unrelated behaviors at once.

## Testing

Run examples-only tests from the repository root:

```bash
npm run test -w examples
```

Useful workspace-specific commands:

```bash
npm run test:e2e -w examples
npm run test:e2e:ui -w examples
npm run test:lighthouse -w examples
```

The root command below is the full monorepo check used when changes affect both the library
and the examples app:

```bash
npm run test:all
```

`tests/e2e/main.spec.ts` verifies the main gallery page, `mobile.spec.ts` checks the mobile
navigation flow, and `sandbox.spec.ts` starts each standalone sample sandbox and ensures it
renders without console errors.

## Deployment

The examples app builds into `examples/dist` and is deployed as a static site to GitHub Pages.
The deployment flow is defined in `.github/workflows/deploy-examples.yaml`, and the release
workflow can deploy the examples site alongside a library release.
