import { render, cleanup, type RenderResult } from "@testing-library/react";
import React from "react";
import { afterEach, bench, describe } from "vitest";
import {
  Chart,
  LineSeries,
  Pane,
  PriceScale,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import { createLineDataFeed, generateLineData } from "./utils";
import type { LineData } from "lightweight-charts";

const lineData = generateLineData(500);
const newLineData = generateLineData(500);

describe("Chart Rendering Performance", () => {
  afterEach(() => {
    cleanup();
  });

  bench("empty chart initialization", () => {
    const { unmount } = render(<Chart />);
    unmount();
  });

  bench("chart with 500 data points", () => {
    const { unmount } = render(
      <Chart>
        <LineSeries data={lineData} />
      </Chart>
    );
    unmount();
  });

  bench("multiple series chart", () => {
    const { unmount } = render(
      <Chart>
        <LineSeries data={lineData} />
        <LineSeries data={lineData} />
        <LineSeries data={lineData} />
      </Chart>
    );
    unmount();
  });

  bench("bulk data replacement", () => {
    const { rerender, unmount } = render(
      <Chart>
        <LineSeries data={lineData} />
      </Chart>
    );

    rerender(
      <Chart>
        <LineSeries data={newLineData} />
      </Chart>
    );

    unmount();
  });

  bench("chart with time custom scale", () => {
    const { unmount } = render(
      <Chart>
        <LineSeries data={lineData} />
        <TimeScale>
          <TimeScaleFitContentTrigger deps={[]} />
        </TimeScale>
      </Chart>
    );
    unmount();
  });

  bench("chart with custom price scale", () => {
    const { unmount } = render(
      <Chart>
        <Pane>
          <LineSeries data={lineData} />
          <PriceScale id="left" />
        </Pane>
      </Chart>
    );
    unmount();
  });
});

// Each iteration rerenders a mounted chart with new `data`, like a live feed does on every tick.
describe("Reactive series data updates", () => {
  for (const size of [10_000, 100_000]) {
    let data: LineData<string>[] = [];
    let nextPoint: () => LineData<string> = () => {
      throw new Error("Benchmark setup did not run");
    };
    let view: RenderResult | null = null;

    const renderSeries = () => (
      <Chart>
        <LineSeries data={data} />
      </Chart>
    );
    const setup = () => {
      ({ data, nextPoint } = createLineDataFeed(size));
      view = render(renderSeries());
    };
    const teardown = () => {
      view?.unmount();
      view = null;
    };

    bench(
      `append one point to ${size} points`,
      () => {
        data = [...data, nextPoint()];
        view?.rerender(renderSeries());
      },
      { setup, teardown }
    );

    bench(
      `replace the last point of ${size} points`,
      () => {
        const lastPoint = data[data.length - 1];
        data = [...data.slice(0, -1), { ...lastPoint, value: lastPoint.value + 1 }];
        view?.rerender(renderSeries());
      },
      { setup, teardown }
    );
  }
});
