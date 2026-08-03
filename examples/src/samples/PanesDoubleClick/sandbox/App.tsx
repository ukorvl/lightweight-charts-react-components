import { useCallback, useRef, useState } from "react";
import {
  CandlestickSeries,
  Chart,
  HistogramSeries,
  LineSeries,
  Pane,
  PriceLine,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import { focusPane, restorePanes, type PaneLayoutSnapshot } from "../paneFocus";
import type { IChartApi, MouseEventParams } from "lightweight-charts";

type PaneId = 0 | 1 | 2;

const isPaneId = (paneIndex: number | undefined): paneIndex is PaneId =>
  paneIndex === 0 || paneIndex === 1 || paneIndex === 2;

const PricePane = () => (
  <CandlestickSeries
    data={candlestickSeriesData}
    options={{
      priceLineVisible: false,
    }}
  />
);

const RsiPane = () => (
  <LineSeries
    data={rsiSeriesData}
    options={{
      color: "#2962FF",
      lineWidth: 2,
      priceLineVisible: false,
    }}
  >
    <PriceLine
      price={70}
      options={{
        color: "#7C4DFF",
        lineWidth: 1,
        lineStyle: 3,
        axisLabelVisible: true,
      }}
    />
    <PriceLine
      price={30}
      options={{
        color: "#7C4DFF",
        lineWidth: 1,
        lineStyle: 3,
        axisLabelVisible: true,
      }}
    />
  </LineSeries>
);

const VolumePane = () => (
  <HistogramSeries
    data={volumeSeriesData}
    options={{
      priceLineVisible: false,
      priceFormat: {
        type: "volume",
      },
    }}
  />
);

const App = () => {
  const [focusedPane, setFocusedPane] = useState<PaneId | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const paneLayoutRef = useRef<PaneLayoutSnapshot | null>(null);

  const onDblClick = useCallback(
    (param: MouseEventParams) => {
      const chart = chartRef.current;
      if (!chart) {
        return;
      }

      if (focusedPane !== null) {
        if (paneLayoutRef.current) {
          restorePanes(chart, paneLayoutRef.current);
        }
        paneLayoutRef.current = null;
        setFocusedPane(null);
        return;
      }

      if (isPaneId(param.paneIndex)) {
        const paneLayout = focusPane(chart, param.paneIndex);
        if (paneLayout) {
          paneLayoutRef.current = paneLayout;
          setFocusedPane(param.paneIndex);
        }
      }
    },
    [focusedPane]
  );

  return (
    <div style={{ fontFamily: "sans-serif", padding: 16 }}>
      <p style={{ margin: "0 0 12px" }}>
        {focusedPane === null
          ? "Double-click any pane to focus it."
          : "Double-click again to restore all panes."}
      </p>
      <Chart
        onDblClick={onDblClick}
        containerProps={{
          id: "panes-double-click-sandbox-chart",
        }}
        onInit={chart => {
          chartRef.current = chart;
        }}
        options={{
          width: 700,
          height: 420,
          layout: {
            panes: {
              enableResize: true,
              separatorColor: "#d0d7de",
            },
          },
        }}
      >
        <PricePane />
        <Pane stretchFactor={1}>
          <RsiPane />
        </Pane>
        <Pane stretchFactor={1}>
          <VolumePane />
        </Pane>
        <TimeScale>
          <TimeScaleFitContentTrigger deps={[]} />
        </TimeScale>
      </Chart>
    </div>
  );
};

const candlestickSeriesData = [
  { time: "2025-01-04", open: 80, high: 82.65, low: 76.67, close: 78.71 },
  { time: "2025-01-05", open: 78.71, high: 82.26, low: 75.37, close: 80.42 },
  { time: "2025-01-06", open: 80.42, high: 83.58, low: 80.16, close: 82.39 },
  { time: "2025-01-07", open: 82.39, high: 87.09, low: 79.75, close: 83.48 },
  { time: "2025-01-08", open: 83.48, high: 85.57, low: 82.5, close: 83.54 },
  { time: "2025-01-09", open: 83.54, high: 86.97, low: 83.3, close: 86.6 },
  { time: "2025-01-10", open: 86.6, high: 88.95, low: 86.37, close: 88.02 },
  { time: "2025-01-11", open: 88.02, high: 88.91, low: 85.93, close: 87.38 },
  { time: "2025-01-12", open: 87.38, high: 87.63, low: 84.52, close: 85.36 },
  { time: "2025-01-13", open: 85.36, high: 90.17, low: 84.21, close: 84.76 },
  { time: "2025-01-14", open: 84.76, high: 86.22, low: 83.51, close: 85.99 },
  { time: "2025-01-15", open: 85.99, high: 86.35, low: 83.83, close: 86.27 },
  { time: "2025-01-16", open: 86.27, high: 90.39, low: 83.85, close: 89.13 },
  { time: "2025-01-17", open: 89.13, high: 93.88, low: 88.65, close: 93.82 },
  { time: "2025-01-18", open: 93.82, high: 97.07, low: 91.0, close: 94.58 },
];

const rsiSeriesData = [
  { time: "2025-01-04" },
  { time: "2025-01-05" },
  { time: "2025-01-06" },
  { time: "2025-01-07" },
  { time: "2025-01-08" },
  { time: "2025-01-09" },
  { time: "2025-01-10" },
  { time: "2025-01-11" },
  { time: "2025-01-12" },
  { time: "2025-01-13" },
  { time: "2025-01-14" },
  { time: "2025-01-15" },
  { time: "2025-01-16" },
  { time: "2025-01-17", value: 63.1 },
  { time: "2025-01-18", value: 66.4 },
];

const volumeSeriesData = [
  { time: "2025-01-04", value: 8321, color: "rgba(38, 166, 154, 0.55)" },
  { time: "2025-01-05", value: 6755, color: "rgba(239, 83, 80, 0.55)" },
  { time: "2025-01-06", value: 1537, color: "rgba(38, 166, 154, 0.55)" },
  { time: "2025-01-07", value: 9764, color: "rgba(38, 166, 154, 0.55)" },
  { time: "2025-01-08", value: 3109, color: "rgba(38, 166, 154, 0.55)" },
  { time: "2025-01-09", value: 5244, color: "rgba(38, 166, 154, 0.55)" },
  { time: "2025-01-10", value: 276, color: "rgba(38, 166, 154, 0.55)" },
  { time: "2025-01-11", value: 4089, color: "rgba(239, 83, 80, 0.55)" },
  { time: "2025-01-12", value: 7812, color: "rgba(239, 83, 80, 0.55)" },
  { time: "2025-01-13", value: 6137, color: "rgba(239, 83, 80, 0.55)" },
  { time: "2025-01-14", value: 7894, color: "rgba(38, 166, 154, 0.55)" },
  { time: "2025-01-15", value: 6137, color: "rgba(38, 166, 154, 0.55)" },
  { time: "2025-01-16", value: 5678, color: "rgba(38, 166, 154, 0.55)" },
  { time: "2025-01-17", value: 2341, color: "rgba(38, 166, 154, 0.55)" },
  { time: "2025-01-18", value: 5643, color: "rgba(38, 166, 154, 0.55)" },
];

export { App };
