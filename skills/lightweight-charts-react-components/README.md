# lightweight-charts-react-components (agent skill)

## Overview

The skill helps coding agents integrate `lightweight-charts-react-components`
into React applications. It provides concrete TypeScript recipes for most common charting scenarios,
with explanations of library-specific design choices and common failure modes.

## Installation and usage

From your project's root, install with the [Skills CLI](https://github.com/vercel-labs/skills):

```sh
npx skills add ukorvl/lightweight-charts-react-components --skill lightweight-charts-react-components
```

Select your coding agent and project installation. Add `--global` to make the skill available across your projects.
Install the chart library and its peer dependencies following the
[library installation guide](../../lib/README.md#installation).

The installed skill is discovered automatically by the agent. Though it can be invoked directly:

```text
Use the lightweight-charts-react-components skill to add a live candlestick chart
with volume below it. Keep the visible range when older history loads.
```
