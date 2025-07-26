import { colors } from "@/common/colors";
import type { CanvasRenderingTarget2D } from "fancy-canvas";
import type {
  Coordinate,
  IChartApi,
  IPrimitivePaneRenderer,
  IPrimitivePaneView,
  ISeriesPrimitive,
  ISeriesPrimitiveAxisView,
  Time,
} from "lightweight-charts";

type VerticalLineOptions = {
  color: string;
  width: number;
  labelBgColor: string;
  labelTextColor: string;
};

type VerticalLineParams = {
  time: Time;
  chart: IChartApi;
  options?: Partial<VerticalLineOptions>;
};

const defaultVerticalLineOptions: VerticalLineOptions = {
  color: colors.red,
  width: 1,
  labelBgColor: colors.red,
  labelTextColor: colors.white,
};

class VerticalLineRenderer implements IPrimitivePaneRenderer {
  constructor(
    private options: VerticalLineOptions,
    private x: Coordinate | null
  ) {}

  draw(target: CanvasRenderingTarget2D) {
    const { width, color } = this.options;

    target.useBitmapCoordinateSpace(scope => {
      if (this.x === null) {
        return;
      }

      const ctx = scope.context;
      const scaledPosition = Math.round(scope.horizontalPixelRatio * this.x);
      const lineWidthInPixels = Math.round(width * scope.horizontalPixelRatio);
      const halfWidth = scaledPosition - (lineWidthInPixels >> 1);

      ctx.fillStyle = color;
      ctx.fillRect(halfWidth, 0, lineWidthInPixels, scope.bitmapSize.height);
    });
  }
}

class VerticalLinePaneView implements IPrimitivePaneView {
  private x: Coordinate | null = null;

  constructor(private primitive: VerticalLine) {}

  renderer() {
    return new VerticalLineRenderer(this.primitive.options, this.x);
  }

  update() {
    const timeScale = this.primitive.chart.timeScale();
    this.x = timeScale.timeToCoordinate(this.primitive.time);
  }
}

class VerticalLineAxisView implements ISeriesPrimitiveAxisView {
  private x: Coordinate | null = null;

  constructor(private primitive: VerticalLine) {}

  update() {
    const timeScale = this.primitive.chart.timeScale();
    this.x = timeScale.timeToCoordinate(this.primitive.time);
  }

  coordinate() {
    return this.x ?? 0;
  }

  text() {
    return this.primitive.time.toString();
  }

  textColor() {
    return this.primitive.options.labelTextColor;
  }

  backColor() {
    return this.primitive.options.labelBgColor;
  }

  tickVisible() {
    return false;
  }
}

class VerticalLine implements ISeriesPrimitive<Time> {
  private _paneViews: VerticalLinePaneView[];
  private _timeAxisViews: VerticalLineAxisView[];

  time: Time;
  chart: IChartApi;
  options: VerticalLineOptions;

  constructor({ chart, time, options }: VerticalLineParams) {
    this.time = time;
    this.chart = chart;

    this.options = { ...defaultVerticalLineOptions, ...options };

    this._paneViews = [new VerticalLinePaneView(this)];
    this._timeAxisViews = [new VerticalLineAxisView(this)];
  }

  updateAllViews(): void {
    this._paneViews.forEach(pw => pw.update());
    this._timeAxisViews.forEach(tw => tw.update());
  }

  timeAxisViews() {
    return this._timeAxisViews;
  }

  paneViews() {
    return this._paneViews;
  }
}

export { VerticalLine, type VerticalLineOptions };
