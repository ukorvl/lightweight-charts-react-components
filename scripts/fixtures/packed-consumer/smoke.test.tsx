// @vitest-environment jsdom

import "mock-match-media/polyfill";
import "vitest-canvas-mock";
import { createRef } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import {
  Chart,
  LineSeries,
  Markers,
  Pane,
  type ChartApiRef,
  type MarkersApiRef,
  type PaneApiRef,
  type SeriesApiRef,
} from "lightweight-charts-react-components";
import type { IChartApi, LineData, SeriesMarker, Time } from "lightweight-charts";

test("renders and updates a chart from the packed package", () => {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const chartRef = createRef<ChartApiRef<Time, IChartApi>>();
  const paneRef = createRef<PaneApiRef>();
  const seriesRef = createRef<SeriesApiRef<"Line">>();
  const markersRef = createRef<MarkersApiRef>();
  const markers: SeriesMarker<Time>[] = [
    { time: "2025-01-01", position: "aboveBar", shape: "arrowDown", color: "#123456" },
  ];
  const data: LineData[] = [{ time: "2025-01-01", value: 10 }];
  const render = (nextData: LineData[]) => {
    flushSync(() => {
      root.render(
        <Chart ref={chartRef} options={{ width: 400, height: 300 }}>
          <Pane ref={paneRef}>
            <LineSeries ref={seriesRef} data={nextData}>
              <Markers ref={markersRef} markers={markers} />
            </LineSeries>
          </Pane>
        </Chart>
      );
    });
  };

  let chartHandle;
  try {
    render(data);
    chartHandle = chartRef.current;
    const chart = chartHandle?.api();
    const pane = paneRef.current?.api();
    const series = seriesRef.current?.api();
    expect(chart).toBeTruthy();
    expect(chart?.panes()).toContain(pane);
    expect(pane?.getSeries()).toContain(series);
    expect(series?.data()).toEqual(data);
    expect(markersRef.current?.api()?.markers()).toEqual(markers);

    const nextData = [...data, { time: "2025-01-02", value: 20 }];
    render(nextData);
    expect(series?.data()).toEqual(nextData);
  } finally {
    root.unmount();
    host.remove();
  }
  expect(chartHandle?.api()).toBeNull();
  expect(host.childElementCount).toBe(0);
});
