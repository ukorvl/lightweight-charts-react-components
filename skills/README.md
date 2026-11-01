# Skills

## Overview

This directory contains agent skills for various purposes. Each skill is a self-contained module that provides specific functionality to coding agents, enabling them to perform tasks more effectively.

The skills list:

- [lightweight-charts-react-components](./lightweight-charts-react-components): A skill that helps coding agents integrate `lightweight-charts-react-components` into React applications, providing concrete TypeScript recipes for common charting scenarios.

## Validation

- `npm run check:skill-recipes` typechecks every `ts` and `tsx` code block against the library source. Name a block with `file=<name>` in its fence (for example, ` ```tsx file=LiveCandles.tsx `) when another block in the same markdown file imports it by a relative path.
- `npm run check:versions-in-sync` keeps the skill compatibility table aligned with `lib/package.json`. Reference versions are a tested baseline, so they only need to stay inside the declared ranges. A library release outside the recipe target, such as a new major, fails until the recipes are verified and the table is updated.
