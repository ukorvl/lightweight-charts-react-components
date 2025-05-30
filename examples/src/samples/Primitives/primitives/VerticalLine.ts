/* eslint-disable @typescript-eslint/no-unused-vars */
import { ICustomSeriesPaneView } from "lightweight-charts";
import { colors } from "@/colors";
import type { CanvasRenderingTarget2D } from "fancy-canvas";
import type {
  Coordinate,
  IPrimitivePaneRenderer,
  IPrimitivePaneView,
  ISeriesPrimitive,
  ISeriesPrimitiveAxisView,
  Time,
} from "lightweight-charts";

interface VerticalLineOptions {
  color: string;
  width: number;
  labelBgColor: string;
  labelTextColor: string;
  labelFontSize: number;
}

const defaultVerticalLineOptions: VerticalLineOptions = {
  color: colors.blue,
  width: 1,
  labelBgColor: colors.blue200,
  labelTextColor: colors.blue,
  labelFontSize: 12,
};

class VerticalLineRenderer implements IPrimitivePaneRenderer {
  constructor(
    private options: VerticalLineOptions,
    x: Coordinate
  ) {}

  draw(target: CanvasRenderingTarget2D) {
    const { width, color } = this.options;

    target.useBitmapCoordinateSpace(scope => {
      scope.context.beginPath();
      scope.context.rect(0, 0, width, scope.bitmapSize.height);
      scope.context.fillStyle = color;
      scope.context.fill();
    });
  }
}

class VerticalLinePaneView implements IPrimitivePaneView {
  constructor(
    private options: VerticalLineOptions,
    private x: Coordinate
  ) {}
  renderer() {
    return new VerticalLineRenderer(this.options, this.x);
  }
}

class VerticalLineAxisView implements ISeriesPrimitiveAxisView {
  constructor(private options: VerticalLineOptions) {}
}

class VerticalLine implements ISeriesPrimitive<Time> {
  constructor(
    private time: Time,
    private options: Partial<VerticalLineOptions> = {}
  ) {
    this.options = { ...defaultVerticalLineOptions, ...options };
  }

  updateAllViews(): void {}

  timeAxisViews() {
    return [];
  }

  paneViews() {
    return [];
  }
}

export { VerticalLine };
