<img
  alt=""
  src="https://raw.githubusercontent.com/ukorvl/design/master/lightweight-charts-react-components/cover.png"
  loading="lazy"
/>

<div align="center">
  <h1>lightweight-charts-react-components &#x1F4C8;</h1>
  <p>A React library of <a href="https://github.com/tradingview/lightweight-charts" target="_blank">Lightweight-charts</a> components written on Typescript</p>
</div>

<p align="center">
  <a href="https://www.npmjs.com/package/lightweight-charts-react-components">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/npm/v/lightweight-charts-react-components?colorA=1e2029&colorB=1e2029&style=flat">
      <img src="https://img.shields.io/npm/v/lightweight-charts-react-components?colorA=ffcc00&colorB=ffcc00&style=flat" alt="Version">
    </picture>
  </a>

  <a href="https://www.npmjs.com/package/lightweight-charts-react-components">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/npm/dm/lightweight-charts-react-components?colorA=1e2029&colorB=1e2029&style=flat">
      <img src="https://img.shields.io/npm/dm/lightweight-charts-react-components?colorA=ffcc00&colorB=ffcc00&style=flat" alt="Downloads">
    </picture>
  </a>

  <a href="https://github.com/ukorvl/lightweight-charts-react-components/actions/workflows/build.yaml">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/github/actions/workflow/status/ukorvl/lightweight-charts-react-components/build.yaml?branch=main&colorA=1e2029&colorB=1e2029&style=flat">
      <img src="https://img.shields.io/github/actions/workflow/status/ukorvl/lightweight-charts-react-components/build.yaml?branch=main&colorA=ffcc00&colorB=ffcc00&style=flat" alt="Build Status">
    </picture>
  </a>

  <a href="https://github.com/ukorvl/lightweight-charts-react-components/blob/main/LICENSE">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/npm/l/lightweight-charts-react-components?colorA=1e2029&colorB=1e2029&style=flat">
      <img src="https://img.shields.io/npm/l/lightweight-charts-react-components?colorA=ffcc00&colorB=ffcc00&style=flat" alt="License">
    </picture>
  </a>

  <a href="https://bundlephobia.com/package/lightweight-charts-react-components">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/bundlephobia/minzip/lightweight-charts-react-components?colorA=1e2029&colorB=1e2029&style=flat">
      <img src="https://img.shields.io/bundlephobia/minzip/lightweight-charts-react-components?colorA=ffcc00&colorB=ffcc00&style=flat" alt="Minified size">
    </picture>
  </a>

  <a href="https://github.com/ukorvl/lightweight-charts-react-components">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/code%20style-eslint-1e2029?style=flat">
      <img src="https://img.shields.io/badge/code%20style-eslint-ffcc00?style=flat" alt="Code Style">
    </picture>
  </a>

  <a href="https://github.com/ukorvl/lightweight-charts-react-components">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/module-ESM--only-1e2029?style=flat">
      <img src="https://img.shields.io/badge/module-ESM--only-ffcc00?style=flat" alt="ESM Only">
    </picture>
  </a>

  <a href="https://github.com/ukorvl/lightweight-charts-react-components">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/contributions-welcome-1e2029?style=flat">
      <img src="https://img.shields.io/badge/contributions-welcome-ffcc00?style=flat" alt="Contributions">
    </picture>
  </a>

  <a href="https://coveralls.io/github/ukorvl/lightweight-charts-react-components">
    <picture>
      <source
        media="(prefers-color-scheme: dark)"
        srcset="https://img.shields.io/coveralls/github/ukorvl/lightweight-charts-react-components?colorA=1e2029&colorB=1e2029&style=flat"
      >
      <img
        src="https://img.shields.io/coveralls/github/ukorvl/lightweight-charts-react-components?colorA=ffcc00&colorB=ffcc00&style=flat"
        alt="Coverage"
      >
    </picture>
  </a>

  <a href="https://jsr.io/@ukorvl/lightweight-charts-react-components">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/jsr/v/%40ukorvl/lightweight-charts-react-components?colorA=1e2029&colorB=1e2029&style=flat">
      <img src="https://img.shields.io/jsr/v/%40ukorvl/lightweight-charts-react-components?colorA=ffcc00&colorB=ffcc00&style=flat" alt="Jsr version">
    </picture>
  </a>
</p>

## Description

This library is a set of React components that wraps the Lightweight-charts library. It provides a simple declarative way to use the Lightweight-charts library in your React application.
Check out the [Demo](https://ukorvl.github.io/lightweight-charts-react-components/) to see the components in action.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Examples](#examples)
- [Contributing](#contributing)
- [Related Projects](#related-projects)
- [License](#license)

## Installation

You can install the library via npm, pnpm or yarn:

```bash
npm install lightweight-charts-react-components lightweight-charts
```

Standalone version of the library is also available for use in the browser without a build step. You can include it in your HTML file using a script tag. Note that library expects global `React`, `ReactDOM` and `LightweightCharts` variables to be available in the global scope.

```html
<head>
  <script
    src="https://unpkg.com/react@18/umd/react.production.min.js"
    crossorigin
  ></script>
  <script
    src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"
    crossorigin
  ></script>
  <script
    src="https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js"
    crossorigin
  ></script>
  <script
    src="https://unpkg.com/lightweight-charts-react-components/dist/lightweight-charts-react-components.standalone.js"
    crossorigin
  ></script>
</head>
<body>
  <script>
    const { Chart, LineSeries } = LightweightChartsReactComponents;
  </script>
</body>
```

## Usage

The library provides a set of components that you can use in your React application. Here is a simple example of how to use the `Chart` and `LineSeries` components:

```tsx
import React from "react";
import { Chart, LineSeries } from "lightweight-charts-react-components";

const data = [
  { time: "2023-01-01", value: 100 },
  { time: "2023-01-02", value: 101 },
  { time: "2023-01-03", value: 102 },
];

const App = () => {
  return (
    <Chart>
      <LineSeries data={data} />
    </Chart>
  );
};

export { App };
```

The following is an advanced example that demonstrates how to use custom scales, panes and multiple series in a single chart:

```tsx
import React from "react";
import {
  Chart,
  LineSeries,
  HistogramSeries,
  PriceScale,
  TimeScale,
  TimeScaleFitContentTrigger,
  Pane,
} from "lightweight-charts-react-components";

const data = [
  { time: "2023-01-01", value: 100 },
  { time: "2023-01-02", value: 101 },
  { time: "2023-01-03", value: 102 },
];
const volumeData = [
  { time: "2023-01-01", value: 1000, color: "rgba(0, 150, 136, 0.5)" },
  { time: "2023-01-02", value: 1100, color: "rgba(0, 150, 136, 0.5)" },
  { time: "2023-01-03", value: 1200, color: "rgba(0, 150, 136, 0.5)" },
];

const chartOptions = {
  // Important to set width and height for the chart
  // Otherwise make chart container scale to its parent size by using containerProps, like:
  // <Chart containerProps={{ style: { width: '100%', height: '100%' } }} />
  // Chart itself automatically resizes to fit its container
  width: 600,
  height: 400,
  // Chart options can be customized here
};

const priceScaleOptions = {
  // Price scale options can be customized here
};

const App = () => {
  return (
    <Chart options={chartOptions}>
      <Pane stretchFactor={2}>
        <LineSeries data={data} />
        <PriceScale id="left" options={priceScaleOptions} />
      </Pane>
      <Pane>
        <HistogramSeries data={volumeData} />
      </Pane>
      <TimeScale>
        <TimeScaleFitContentTrigger deps={[]} />
      </TimeScale>
    </Chart>
  );
};

export { App };
```

### Chart Container Sizing

The `Chart` component requires explicit width and height to render correctly. You can set these dimensions directly via the `options` prop or make the chart container scale to its parent size using the `containerProps` prop.
Note that the chart will automatically resize to fit its container.

There may be cases where the chart's parent HTML element has no size defined (for example, when the parent is a flex container with no defined height). In such cases, you need to ensure that the parent element has a defined size (width and height) for the chart to render properly.

## Examples

The [examples](https://github.com/ukorvl/lightweight-charts-react-components/blob/main/examples/) app itself is a [Demo](https://ukorvl.github.io/lightweight-charts-react-components/) web application, but it contains a lot of examples of how to use the library. You can find the source code in the [samples folder](https://github.com/ukorvl/lightweight-charts-react-components/blob/main/examples/src/samples).
You can run and test the code locally by cloning the repository and running the examples app.

## Contributing

We welcome contributions of all kinds! Whether it's fixing bugs, adding new features, improving examples, or suggesting ideas—your help is greatly appreciated.

### How to Contribute

1. Fork the repository and create a new branch for your changes.
2. Make your changes following the project guidelines.
3. Test your changes to ensure everything works as expected.
4. Submit a pull request.

For detailed contribution guidelines, please check out our [CONTRIBUTING.md](https://github.com/ukorvl/lightweight-charts-react-components/blob/main/CONTRIBUTING.md)
Thank you for helping improve this project!

## Related Projects

- [lightweight-charts](https://github.com/tradingview/lightweight-charts) - The original Lightweight Charts library by TradingView.
- [lightweight-charts-vue](https://github.com/ukorvl/lightweight-charts-vue) - Vue.js wrapper for Lightweight Charts.

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/ukorvl/lightweight-charts-react-components/blob/main/lib/LICENSE) file for details.
