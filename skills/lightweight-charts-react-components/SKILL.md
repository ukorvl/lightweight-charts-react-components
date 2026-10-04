---
name: lightweight-charts-react-components
description: Helps to integrate lightweight-charts-react-components library (which uses lightweight-charts by TradingView under the hood) into React applications for creating interactive financial charts, use correct code snippets and examples, and provide guidance on React TradingView chart customization and data handling. Use when the user mentions lightweight-charts by TradingView in React, chart integration, or financial data visualization in React applications.
license: MIT
metadata:
  author: ukorvl
  version: "1.0"
---

# lightweight-charts-react-components guide

## Overview

## Quick Start

## Examples and snippets (reference files)

Read the reference matching the user's outcome. Each contains a complete TypeScript
recipe, data and integration contracts, reasons for the architecture, failure modes,
and acceptance checks. Combine references when a task spans several outcomes; do
not load every reference for a simple chart.

| User request or pain                                                                 | Reference                                                                        |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| WebSocket candles, updating the current bar, stale history, excessive chart renders  | [Market data and live updates](references/market-data-and-live-updates.md)       |
| Older history on scroll, viewport jumps, symbol/interval changes, late API responses | [History and range selection](references/history-and-range-selection.md)         |
| Candles plus volume, moving averages, oscillator panes, independent price scales     | [Price, volume, and indicators](references/price-volume-and-indicators.md)       |
| OHLC legend, hover details, missing data, tooltip positioning                        | [Hover legends and tooltips](references/hover-legends-and-tooltips.md)           |
| Executions and signals, stop/target levels, click-to-place price lines               | [Trade markers and price levels](references/trade-markers-and-price-levels.md)   |
| Compare assets with different prices, fixed-baseline returns, toggle comparisons     | [Performance comparison](references/performance-comparison.md)                   |
| Separate charts that share scrolling, zooming, and a crosshair                       | [Synchronized charts](references/synchronized-charts.md)                         |
| Trading-session shading, pane backgrounds, custom drawing that follows zoom          | [Session overlays and primitives](references/session-overlays-and-primitives.md) |
| Options strikes, yield maturities, choosing a numeric or custom horizontal axis      | [Numeric axes and chart types](references/numeric-axes-and-chart-types.md)       |

The selection follows application problems rather than listing every component.
Direct user questions about [fitting chart content](https://github.com/ukorvl/lightweight-charts-react-components/discussions/127),
[grouping series in panes](https://github.com/ukorvl/lightweight-charts-react-components/discussions/143),
and [overlaying volume on an independent scale](https://github.com/ukorvl/lightweight-charts-react-components/issues/402)
establish concrete demand. The other scenarios are application recipes inferred
from the repository's working samples and API behavior, not claims about measured
user demand. Historical discussions describe older APIs; the recipes follow the
current implementation.

Examples target the repository's library and installed Lightweight Charts types.
They use public package imports, plain React, and application-supplied data adapters;
MUI, Zustand, and demo data generators are not required. The recipes are verified
against Lightweight Charts 5.2.1, the repository's pinned version. Some upstream
APIs shown here may be absent in older 5.x versions; check the installed declarations
when adapting to another consumer version.

To extend this collection, start with a reproducible user task from an issue,
discussion, support request, or application integration. Identify the library-specific
decision that prevents a working solution, verify it against source and a runnable
sample, and add or extend the reference that owns that decision. A new component
alone does not require a new scenario file.

## Common edge cases
