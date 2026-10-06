---
name: lightweight-charts-react-components
description: lightweight-charts-react-components recipes for TradingView lightweight-charts in React. Candlestick, line, and area series; volume and indicator panes; realtime WebSocket updates; infinite history on scroll; crosshair OHLC legends and tooltips; trade markers and price lines; synchronized charts; numeric options and yield-curve axes. Use when adding or fixing a financial or trading chart in a React app, or when the user mentions lightweight-charts, TradingView charts in React, or this package.
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

1. Check versions against the compatibility table below. Read declared ranges
   from the app's `package.json`, then the installed versions from the `version`
   field of `node_modules/<package>/package.json` for
   `lightweight-charts-react-components`, `lightweight-charts`, `react`, and
   `react-dom`. If the library is not installed, follow
   [Installation](#installation). Ensure chart rendering runs in the browser,
   within the app's client boundary.
2. For a basic static chart, start from the minimal chart below. Otherwise, read the
   reference matching the requested behavior. Adapt its feed and UI; preserve its
   data contract, component nesting, and API readiness handling.
3. Choose one data owner: pass the complete dataset through `data` for React-owned
   updates, or use `reactive={false}` and the series API for frequent ticks.

### Installation

Install the wrapper together with its `lightweight-charts` peer dependency, using
the project's package manager. React and React DOM must already be installed.

```sh
npm install lightweight-charts-react-components lightweight-charts
```

### Minimal chart

```tsx
import type { LineData, UTCTimestamp } from "lightweight-charts";
import {
  Chart,
  LineSeries,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";

// Data must be sorted ascending by time with unique times (UTC seconds here).
export function SimpleLineChart({ data }: { data: LineData<UTCTimestamp>[] }) {
  return (
    // autoSize follows the container, which needs a nonzero height.
    <Chart
      options={{ autoSize: true }}
      containerProps={{ style: { height: 300, width: "100%" } }}
    >
      <LineSeries data={data} />
      <TimeScale>
        <TimeScaleFitContentTrigger deps={[]} />
      </TimeScale>
    </Chart>
  );
}
```

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

If no reference matches the request, tell the user that the skill has no recipe
for it. Then build the solution from the public components and the upstream
`lightweight-charts` API, applying the Quick Start rules and the edge cases below.

### Skill compatibility

The recipes are verified against the reference versions below. These are the
tested baseline, not the latest available releases.

If an installed version differs from the reference version, compare it with the
compatibility range. Inside the range, recipes apply as written. Outside it,
tell the user about the mismatch before writing code, because breaking API
changes can affect the recipes, and verify every API the recipe uses against
the installed package.

| Dependency or environment             | Reference version | Compatibility range and checks                                                                                                                       |
| ------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lightweight-charts-react-components` | `2.6.0`           | Recipe target: `>=2.6.0 <3`. Other versions require checking installed exports, chart API refs, and reactive data behavior before adapting a recipe. |
| `lightweight-charts`                  | `5.2.1`           | Declared peer: `>=5.0.8 <6`.                                                                                                                         |
| React and React DOM                   | `19.2.6`          | Declared peers: `>=18.2 <20`. Keep `react` and `react-dom` on matching versions and use the application's existing React instance.                   |
| Node.js                               | —                 | Package engines: `>=18.14.0`. The app's build tools can require a newer version.                                                                     |
| Module system                         | ESM               | ESM `import` entry only; there is no CommonJS `require` entry.                                                                                       |
| Rendering                             | Browser           | Charts need the DOM and canvas. Render them on the client, never during server rendering.                                                            |

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
- **Data updates:** Use `data` for React-owned updates, or `reactive={false}` and the
  series API when per-tick React renders are measurably costly. Avoid mixing both.
  Reactive `data` is always the complete dataset. The wrapper calls `update()` only
  when every earlier item keeps the same object reference and the new array either
  replaces the last item with one of the same time or appends exactly one item
  with a new time. Anything else (including `alwaysReplaceData`) calls `setData()`.
  To keep the incremental path, copy data once at the boundary and never clone or
  mutate earlier items. See [live updates](references/market-data-and-live-updates.md).
