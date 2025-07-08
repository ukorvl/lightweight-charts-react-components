import { render, cleanup } from "@testing-library/react";
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
import { generateLineData } from "./utils";

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
