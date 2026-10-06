// Browser inputs for extracted reference modules. Relative imports resolve only
// in the generated consumer; the snippet runner typechecks fixtures and recipes
// together. Keys match TSX filenames in snippets.json, so missing fixtures fail.
import { AnalysisChart } from "./generated/AnalysisChart";
import { CandleDetails } from "./generated/CandleDetails";
import { ImperativeCandles } from "./generated/ImperativeCandles";
import { InstrumentHistory } from "./generated/InstrumentHistory";
import { LiveCandles } from "./generated/LiveCandles";
import { PaginatedHistory } from "./generated/PaginatedHistory";
import { PriceWithVolumeOverlay } from "./generated/PriceWithVolumeOverlay";
import { QuarterlyChart } from "./generated/QuarterlyChart";
import { ReturnComparison } from "./generated/ReturnComparison";
import { SessionChart } from "./generated/SessionChart";
import { SynchronizedCharts } from "./generated/SynchronizedCharts";
import { TradeAnnotations } from "./generated/TradeAnnotations";
import { VolatilitySmile, exampleSmile } from "./generated/VolatilitySmile";
import { YieldComparison, exampleYields } from "./generated/YieldComparison";
import type { UTCTimestamp } from "lightweight-charts";
import type { ReactNode } from "react";

const candles = Array.from({ length: 40 }, (_, index) => ({
  time: (1704067200 + index * 86400) as UTCTimestamp,
  open: 100 + index,
  high: 102 + index,
  low: 99 + index,
  close: 101 + index,
  volume: 1000 + index * 10,
}));
const points = candles.map(({ time, close }) => ({ time, value: close }));
const volume = candles.map(({ time, volume: value }) => ({ time, value }));
const subscribe = () => () => {};

export const fixtures: Record<string, ReactNode> = {
  LiveCandles: <LiveCandles initialData={candles} subscribe={subscribe} />,
  ImperativeCandles: <ImperativeCandles initialData={candles} subscribe={subscribe} />,
  PaginatedHistory: (
    <PaginatedHistory
      initialData={points}
      loadOlder={async () => ({ data: [], hasMore: false })}
    />
  ),
  InstrumentHistory: <InstrumentHistory loadSnapshot={async () => candles} />,
  AnalysisChart: (
    <AnalysisChart
      candles={candles}
      rsi={points.map(point => ({ ...point, value: 50 }))}
      datasetId="fixture"
    />
  ),
  PriceWithVolumeOverlay: <PriceWithVolumeOverlay price={candles} volume={volume} />,
  CandleDetails: <CandleDetails symbol="FIXTURE" data={candles} />,
  TradeAnnotations: (
    <TradeAnnotations
      candles={candles}
      executions={[{ id: "buy", barTime: candles[0].time, side: "buy", quantity: 1 }]}
      initialLevels={[{ id: "stop", price: 99, title: "Stop", color: "red" }]}
      tickSize={0.01}
      precision={2}
    />
  ),
  ReturnComparison: (
    <ReturnComparison
      assets={[
        { id: "first", label: "First", color: "blue", data: points },
        {
          id: "second",
          label: "Second",
          color: "red",
          data: points.map(point => ({ ...point, value: point.value * 2 })),
        },
      ]}
    />
  ),
  SynchronizedCharts: (
    <SynchronizedCharts
      first={points}
      second={points.map(point => ({ ...point, value: point.value * 2 }))}
    />
  ),
  SessionChart: (
    <SessionChart
      candles={candles}
      volume={volume}
      bands={[
        {
          id: "session",
          from: candles[1].time,
          to: candles[5].time,
          color: "rgba(0, 0, 255, 0.1)",
        },
      ]}
    />
  ),
  VolatilitySmile: <VolatilitySmile data={exampleSmile} expiryId="fixture" />,
  YieldComparison: (
    <YieldComparison
      current={exampleYields}
      previous={exampleYields.map(point => ({ ...point, value: point.value - 0.2 }))}
      curveId="fixture"
    />
  ),
  QuarterlyChart: (
    <QuarterlyChart
      data={[
        { time: "2024-01-01", value: 1 },
        { time: "2024-04-01", value: 2 },
      ]}
    />
  ),
};
