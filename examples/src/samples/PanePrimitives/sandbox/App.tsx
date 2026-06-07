import { useMemo, useState } from "react";
import {
  CandlestickSeries,
  Chart,
  HistogramSeries,
  Pane,
  PanePrimitive,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import type { CanvasRenderingTarget2D } from "fancy-canvas";
import type {
  IChartApiBase,
  IPaneApi,
  IPanePrimitive,
  IPanePrimitivePaneView,
  IPrimitivePaneRenderer,
  PrimitivePaneViewZOrder,
} from "lightweight-charts";

type SessionBand = {
  from: string;
  to: string;
  color: string;
  label: string;
  labelColor?: string;
};

type SessionHighlightOptions = {
  labelFontFamily: string;
  labelFontSize: number;
  labelPadding: number;
  labelTextColor: string;
  zOrder: PrimitivePaneViewZOrder;
};

type SessionHighlightParams = {
  bands: SessionBand[];
  chart: IChartApiBase<string>;
  pane: IPaneApi<string>;
  options?: Partial<SessionHighlightOptions>;
};

type RenderableBand = {
  color: string;
  label: string;
  labelColor: string;
  x: number;
  width: number;
};

const defaultOptions: SessionHighlightOptions = {
  labelFontFamily: "system-ui, sans-serif",
  labelFontSize: 12,
  labelPadding: 10,
  labelTextColor: "#f8fafc",
  zOrder: "bottom",
};

class SessionHighlightRenderer implements IPrimitivePaneRenderer {
  constructor(
    private bands: RenderableBand[],
    private options: SessionHighlightOptions
  ) {}

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace(scope => {
      const { bitmapSize, context, horizontalPixelRatio, verticalPixelRatio } = scope;
      const fontSize = Math.round(this.options.labelFontSize * verticalPixelRatio);
      const paddingX = Math.round(this.options.labelPadding * horizontalPixelRatio);
      const paddingY = Math.round(this.options.labelPadding * verticalPixelRatio);

      for (const band of this.bands) {
        const x = Math.round(band.x * horizontalPixelRatio);
        const width = Math.max(1, Math.round(band.width * horizontalPixelRatio));

        context.fillStyle = band.color;
        context.fillRect(x, 0, width, bitmapSize.height);

        context.save();
        context.font = `600 ${fontSize}px ${this.options.labelFontFamily}`;
        context.textAlign = "left";
        context.textBaseline = "top";
        context.fillStyle = band.labelColor;
        context.fillText(band.label, x + paddingX, paddingY);
        context.restore();
      }
    });
  }
}

class SessionHighlightPaneView implements IPanePrimitivePaneView {
  private bands: RenderableBand[] = [];

  constructor(private primitive: SessionHighlight) {}

  update() {
    const timeScale = this.primitive.chart.timeScale();
    this.bands = this.primitive.bands.flatMap(band => {
      const start = timeScale.timeToCoordinate(band.from);
      const end = timeScale.timeToCoordinate(band.to);

      if (start === null || end === null) {
        return [];
      }

      return [
        {
          color: band.color,
          label: band.label,
          labelColor: band.labelColor ?? this.primitive.options.labelTextColor,
          x: Math.min(start, end),
          width: Math.max(1, Math.abs(end - start)),
        },
      ];
    });
  }

  renderer() {
    return new SessionHighlightRenderer(this.bands, this.primitive.options);
  }

  zOrder() {
    return this.primitive.options.zOrder;
  }
}

class SessionHighlight implements IPanePrimitive<string> {
  private paneViewsRef: SessionHighlightPaneView[];

  bands: SessionBand[];
  chart: IChartApiBase<string>;
  pane: IPaneApi<string>;
  options: SessionHighlightOptions;

  constructor({ bands, chart, pane, options }: SessionHighlightParams) {
    this.bands = bands;
    this.chart = chart;
    this.pane = pane;
    this.options = { ...defaultOptions, ...options };
    this.paneViewsRef = [new SessionHighlightPaneView(this)];
  }

  updateAllViews() {
    this.paneViewsRef.forEach(view => view.update());
  }

  paneViews() {
    return this.paneViewsRef;
  }
}

const accent = "#7c3aed";
const bg = "#0f172a";
const text = "#e2e8f0";
const muted = "#94a3b8";

const App = () => {
  const [showOnPricePane, setShowOnPricePane] = useState(true);
  const [showOnVolumePane, setShowOnVolumePane] = useState(true);

  const renderHighlightPrimitive = useMemo(
    () =>
      ({ chart, pane }: { chart: IChartApiBase<string>; pane: IPaneApi<string> }) =>
        new SessionHighlight({
          bands: highlightBands,
          chart,
          pane,
          options: {
            labelFontFamily: "system-ui, sans-serif",
            zOrder: "bottom",
          },
        }),
    []
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        margin: 0,
        padding: "24px",
        boxSizing: "border-box",
        background:
          "radial-gradient(circle at top, rgba(124,58,237,0.2), transparent 32%), #020617",
        color: text,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "24px",
          borderRadius: "20px",
          background: "rgba(15, 23, 42, 0.88)",
          border: "1px solid rgba(148, 163, 184, 0.16)",
          boxShadow: "0 20px 60px rgba(2, 6, 23, 0.45)",
        }}
      >
        <div style={{ marginBottom: "18px" }}>
          <div
            style={{
              color: accent,
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            Pane primitives
          </div>
          <h1 style={{ margin: 0, fontSize: "28px", lineHeight: 1.1 }}>
            Pane-wide session bands on price and volume panes
          </h1>
          <p style={{ margin: "10px 0 0", color: muted, lineHeight: 1.5 }}>
            This sandbox attaches the same pane primitive to different panes and toggles
            them independently.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "18px",
          }}
        >
          <label style={controlStyle}>
            <input
              type="checkbox"
              checked={showOnPricePane}
              onChange={() => setShowOnPricePane(prevState => !prevState)}
            />
            <span>Highlight price pane</span>
          </label>
          <label style={controlStyle}>
            <input
              type="checkbox"
              checked={showOnVolumePane}
              onChange={() => setShowOnVolumePane(prevState => !prevState)}
            />
            <span>Highlight volume pane</span>
          </label>
        </div>

        <Chart
          options={{
            width: 700,
            height: 460,
            layout: {
              attributionLogo: false,
              background: {
                color: bg,
              },
              textColor: text,
              panes: {
                enableResize: true,
                separatorColor: "rgba(148, 163, 184, 0.18)",
              },
            },
            grid: {
              vertLines: {
                color: "rgba(148, 163, 184, 0.10)",
              },
              horzLines: {
                color: "rgba(148, 163, 184, 0.10)",
              },
            },
            crosshair: {
              vertLine: {
                color: "rgba(226, 232, 240, 0.35)",
              },
              horzLine: {
                color: "rgba(226, 232, 240, 0.35)",
              },
            },
          }}
        >
          <Pane stretchFactor={3}>
            <CandlestickSeries
              data={candlestickData}
              options={{
                upColor: "transparent",
                downColor: "#f97316",
                borderUpColor: "#60a5fa",
                borderDownColor: "#f97316",
                wickUpColor: "#60a5fa",
                wickDownColor: "#f97316",
                priceLineVisible: false,
              }}
            />
            {showOnPricePane && <PanePrimitive render={renderHighlightPrimitive} />}
          </Pane>
          <Pane stretchFactor={1}>
            <HistogramSeries
              data={volumeData}
              options={{
                priceLineVisible: false,
                priceFormat: {
                  type: "volume",
                },
              }}
            />
            {showOnVolumePane && <PanePrimitive render={renderHighlightPrimitive} />}
          </Pane>
          <TimeScale>
            <TimeScaleFitContentTrigger deps={[]} />
          </TimeScale>
        </Chart>
      </div>
    </div>
  );
};

const controlStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 14px",
  borderRadius: "999px",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  background: "rgba(15, 23, 42, 0.72)",
  color: text,
  fontSize: "14px",
} as const;

const candlestickData = [
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

const volumeData = [
  { time: "2025-01-04", value: 321, color: "rgba(40, 164, 156, 0.65)" },
  { time: "2025-01-05", value: 278, color: "rgba(40, 164, 156, 0.65)" },
  { time: "2025-01-06", value: 412, color: "rgba(40, 164, 156, 0.65)" },
  { time: "2025-01-07", value: 387, color: "rgba(255, 107, 107, 0.65)" },
  { time: "2025-01-08", value: 345, color: "rgba(40, 164, 156, 0.65)" },
  { time: "2025-01-09", value: 466, color: "rgba(40, 164, 156, 0.65)" },
  { time: "2025-01-10", value: 512, color: "rgba(40, 164, 156, 0.65)" },
  { time: "2025-01-11", value: 438, color: "rgba(255, 107, 107, 0.65)" },
  { time: "2025-01-12", value: 372, color: "rgba(255, 107, 107, 0.65)" },
  { time: "2025-01-13", value: 490, color: "rgba(255, 107, 107, 0.65)" },
  { time: "2025-01-14", value: 295, color: "rgba(40, 164, 156, 0.65)" },
  { time: "2025-01-15", value: 314, color: "rgba(40, 164, 156, 0.65)" },
  { time: "2025-01-16", value: 531, color: "rgba(40, 164, 156, 0.65)" },
  { time: "2025-01-17", value: 622, color: "rgba(40, 164, 156, 0.65)" },
  { time: "2025-01-18", value: 404, color: "rgba(255, 107, 107, 0.65)" },
];

const highlightBands: SessionBand[] = [
  {
    from: "2025-01-05",
    to: "2025-01-07",
    color: "rgba(87, 195, 255, 0.16)",
    label: "Range build-up",
    labelColor: "#57c3ff",
  },
  {
    from: "2025-01-10",
    to: "2025-01-12",
    color: "rgba(255, 183, 77, 0.18)",
    label: "Macro event",
    labelColor: "#ffb74d",
  },
  {
    from: "2025-01-15",
    to: "2025-01-17",
    color: "rgba(137, 81, 255, 0.18)",
    label: "Trend expansion",
    labelColor: "#8951ff",
  },
];

export { App };
