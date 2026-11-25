// Compile-only checks against the public declarations, run by typecheck:lib-tests.
import {
  AreaSeries,
  BarSeries,
  BaselineSeries,
  CandlestickSeries,
  CustomSeries,
  HistogramSeries,
  LineSeries,
} from "lightweight-charts-react-components";
import type { SeriesProps } from "lightweight-charts-react-components";
import type { ICustomSeriesPaneView } from "lightweight-charts";

declare const plugin: ICustomSeriesPaneView;
declare const numericPlugin: ICustomSeriesPaneView<number>;

<CustomSeries data={[]} plugin={plugin} />;
<CustomSeries<number> data={[{ time: 1 }]} plugin={numericPlugin} />;
({ data: [], plugin }) satisfies SeriesProps<"Custom">;

// @ts-expect-error CustomSeries requires a plugin.
<CustomSeries data={[]} />;
// @ts-expect-error CustomSeries requires a plugin for custom horizontal scales too.
<CustomSeries<number> data={[{ time: 1 }]} />;
// @ts-expect-error An undefined plugin cannot render a custom series.
<CustomSeries data={[]} plugin={undefined} />;
// @ts-expect-error An empty object does not implement the upstream plugin interface.
<CustomSeries data={[]} plugin={{}} />;
// @ts-expect-error The public props type also requires a plugin.
({ data: [] }) satisfies SeriesProps<"Custom">;

// Built-in series still compile without a plugin.
<AreaSeries data={[]} />;
<BarSeries data={[]} />;
<BaselineSeries data={[]} />;
<CandlestickSeries data={[]} />;
<HistogramSeries data={[]} />;
<LineSeries data={[]} />;
// @ts-expect-error Built-in series do not accept a custom-series plugin.
<LineSeries data={[]} plugin={plugin} />;
