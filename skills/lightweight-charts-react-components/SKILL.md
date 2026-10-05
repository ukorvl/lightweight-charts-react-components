---
name: lightweight-charts-react-components
description: Helps to integrate lightweight-charts-react-components library (which uses lightweight-charts by TradingView under the hood) into React applications for creating interactive financial charts, use correct code snippets and examples, and provide guidance on React TradingView chart customization and data handling. Use when the user mentions lightweight-charts by TradingView in React, chart integration, or financial data visualization in React applications.
license: MIT
metadata:
  author: ukorvl
  version: "1.0"
---

# lightweight-charts-react-components guide

## Quick Start

Let the components manage chart and series creation and cleanup. Import components
and ref types from `lightweight-charts-react-components`; import native data, option,
and event types from `lightweight-charts`.

1. Check the app's installed versions against the compatibility table below.
   Ensure chart rendering runs in the browser, within the app's client boundary.
2. Read the reference matching the requested behavior. Adapt its feed and UI;
   preserve its data contract, component nesting, and API readiness handling.
3. Choose one data owner: pass the complete dataset through `data` for React-owned
   updates, or use `reactive={false}` and the series API for frequent ticks.
4. Run the app's typecheck and the reference's acceptance checks in a browser.

## Examples and snippets (reference files)

Read the reference matching the user's outcome. Each contains a complete TypeScript
recipe, data and integration contracts, reasons for the architecture, failure modes,
and acceptance checks. Combine references when a task spans several outcomes; do
not load every reference for a simple chart.

| User request                                                                         | Reference                                                                        |
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

The recipes are verified against that exact pinned versions of the library and other dependencies.
If some dependency on the target project does not match, use the compatibility table below.
If you can not find a matching reference, report this directly to the user.
This is not a blocker, but breaking API changes may influence the outcome.
All inconsistencies should be reported and checked before proceeding with a solution.

### Skill compatibility

Current versions below are the reference baseline, not the latest available
releases. Reference version is version used in examples in the recipes.

| Dependency or environment             | Reference version           | Compatibility range and checks                                                                                                                                                |
| ------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lightweight-charts-react-components` | `2.6.0`                     | Recipe target: `>=2.6.0 <3`. Other versions require checking installed exports, chart API refs, and reactive data behavior before adapting a recipe.                          |
| `lightweight-charts`                  | `5.2.1`                     | Declared peer: `>=5.0.8 <6`.                                                                                                                                                  |
| React and React DOM                   | `19.2.6`                    | Declared peers: `>=18.2 <20`. Keep `react` and `react-dom` on matching versions and use the application's existing React instance.                                            |
| Node.js                               | `24.x` repository toolchain | Published npm package: `>=18.14.0`; repository and evaluation scripts: `>=24`. Consumer build tools can impose a higher minimum. Chart rendering needs a browser environment. |
| Module system                         | ESM                         | Package exports provide an ESM `import` entry, with no CommonJS `require` entry.                                                                                              |

## Common edge cases

- **Chart sizing:** Put DOM styles on `containerProps` and give the chart a
  nonzero height.
- **Required ancestors:** Headless chart children need a chart wrapper ancestor.
  `Markers`, `PriceLine`, and `SeriesPrimitive` belong inside their series;
  `PriceScale`, `Watermark`, and `PanePrimitive` require a `Pane`;
  `TimeScaleFitContentTrigger` requires a `TimeScale`.
- **API refs and readiness:** Use `ref.current?.api()` for the native API and
  `containerRef` for the div. For `Chart`, use `ChartApiRef<Time, IChartApi>`.
  `.api()` can initially return null; follow the recipe's readiness step before
  imperative setup.
- **Viewport resets:** To preserve scroll/zoom, keep the chart's key stable and
  live/history updates out of fit-trigger dependencies. Fit on initial load or a
  deliberate reset. See [range handling](references/history-and-range-selection.md).
