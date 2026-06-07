import type { CanvasRenderingTarget2D } from "fancy-canvas";
import type {
  IChartApiBase,
  IPaneApi,
  IPanePrimitive,
  IPanePrimitivePaneView,
  IPrimitivePaneRenderer,
  PrimitivePaneViewZOrder,
  Time,
} from "lightweight-charts";

type SessionHighlightBand<HorzScaleItem = Time> = {
  from: HorzScaleItem;
  to: HorzScaleItem;
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

type SessionHighlightParams<HorzScaleItem = Time> = {
  bands: SessionHighlightBand<HorzScaleItem>[];
  chart: IChartApiBase<HorzScaleItem>;
  pane: IPaneApi<HorzScaleItem>;
  options?: Partial<SessionHighlightOptions>;
};

type RenderableBand = {
  color: string;
  label: string;
  labelColor: string;
  x: number;
  width: number;
};

const defaultSessionHighlightOptions: SessionHighlightOptions = {
  labelFontFamily: "monospace",
  labelFontSize: 12,
  labelPadding: 10,
  labelTextColor: "#f0f0f0",
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
      const labelFontSize = Math.round(this.options.labelFontSize * verticalPixelRatio);
      const labelPaddingX = Math.round(this.options.labelPadding * horizontalPixelRatio);
      const labelPaddingY = Math.round(this.options.labelPadding * verticalPixelRatio);

      for (const band of this.bands) {
        const x = Math.round(band.x * horizontalPixelRatio);
        const width = Math.max(1, Math.round(band.width * horizontalPixelRatio));

        context.fillStyle = band.color;
        context.fillRect(x, 0, width, bitmapSize.height);

        context.save();
        context.font = `600 ${labelFontSize}px ${this.options.labelFontFamily}`;
        context.textAlign = "left";
        context.textBaseline = "top";
        context.fillStyle = band.labelColor;
        context.fillText(band.label, x + labelPaddingX, labelPaddingY);
        context.restore();
      }
    });
  }
}

class SessionHighlightPaneView<HorzScaleItem = Time> implements IPanePrimitivePaneView {
  private bands: RenderableBand[] = [];

  constructor(private primitive: SessionHighlight<HorzScaleItem>) {}

  update() {
    const timeScale = this.primitive.chart.timeScale();
    this.bands = this.primitive.bands.flatMap(band => {
      const start = timeScale.timeToCoordinate(band.from);
      const end = timeScale.timeToCoordinate(band.to);

      if (start === null || end === null) {
        return [];
      }

      const x = Math.min(start, end);
      const width = Math.max(1, Math.abs(end - start));

      return [
        {
          color: band.color,
          label: band.label,
          labelColor: band.labelColor ?? this.primitive.options.labelTextColor,
          x,
          width,
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

class SessionHighlight<HorzScaleItem = Time> implements IPanePrimitive<HorzScaleItem> {
  private paneViewsRef: SessionHighlightPaneView<HorzScaleItem>[];

  bands: SessionHighlightBand<HorzScaleItem>[];
  chart: IChartApiBase<HorzScaleItem>;
  pane: IPaneApi<HorzScaleItem>;
  options: SessionHighlightOptions;

  constructor({ bands, chart, pane, options }: SessionHighlightParams<HorzScaleItem>) {
    this.bands = bands;
    this.chart = chart;
    this.pane = pane;
    this.options = { ...defaultSessionHighlightOptions, ...options };
    this.paneViewsRef = [new SessionHighlightPaneView(this)];
  }

  updateAllViews() {
    this.paneViewsRef.forEach(view => view.update());
  }

  paneViews() {
    return this.paneViewsRef;
  }
}

export { SessionHighlight, type SessionHighlightBand };
