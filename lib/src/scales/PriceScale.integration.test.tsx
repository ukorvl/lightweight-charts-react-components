import "vitest-canvas-mock";
import { render } from "@testing-library/react";
import { createRef } from "react";
import React from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { Chart } from "@/chart";
import type { ChartApiRef } from "@/chart/types";
import { Pane } from "@/pane";
import { HistogramSeries, LineSeries } from "@/series";
import { PriceScale } from "./PriceScale";
import type { IChartApi, Time } from "lightweight-charts";

// Renders a real lightweight-charts instance (development build, which throws on unknown
// price scale ids) to cover the upstream lookup that the mocked unit tests cannot reach.

const data = [
  { time: "2025-01-01", value: 100 },
  { time: "2025-01-02", value: 101 },
];
const chartOptions = { width: 400, height: 300 };
const overlayOptions = { scaleMargins: { top: 0.8, bottom: 0 } };

describe("PriceScale with a real chart", () => {
  beforeAll(() => {
    // jsdom has no matchMedia, which lightweight-charts uses to watch the device pixel ratio
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    });
  });

  it("applies options to an overlay price scale declared inside its series", () => {
    const chartRef = createRef<ChartApiRef<Time, IChartApi>>();

    render(
      <Chart ref={chartRef} options={chartOptions}>
        <Pane>
          <LineSeries data={data} />
          <HistogramSeries data={data} options={{ priceScaleId: "volume" }}>
            <PriceScale id="volume" options={overlayOptions} />
          </HistogramSeries>
        </Pane>
      </Chart>
    );

    const chart = chartRef.current!.api()!;
    expect(chart.priceScale("volume", 0).options().scaleMargins).toEqual(
      overlayOptions.scaleMargins
    );
  });

  it("applies options to an overlay price scale in a non-first pane", () => {
    const chartRef = createRef<ChartApiRef<Time, IChartApi>>();

    render(
      <Chart ref={chartRef} options={chartOptions}>
        <Pane>
          <LineSeries data={data} />
        </Pane>
        <Pane>
          <HistogramSeries data={data} options={{ priceScaleId: "volume" }} />
          <PriceScale id="volume" options={overlayOptions} />
        </Pane>
      </Chart>
    );

    const chart = chartRef.current!.api()!;
    expect(chart.priceScale("volume", 1).options().scaleMargins).toEqual(
      overlayOptions.scaleMargins
    );
  });

  it("applies default price scale options to its own pane only", () => {
    const chartRef = createRef<ChartApiRef<Time, IChartApi>>();

    render(
      <Chart ref={chartRef} options={chartOptions}>
        <Pane>
          <LineSeries data={data} />
        </Pane>
        <Pane>
          <LineSeries data={data} />
          <PriceScale id="right" options={{ invertScale: true }} />
        </Pane>
      </Chart>
    );

    const chart = chartRef.current!.api()!;
    expect(chart.priceScale("right", 0).options().invertScale).toBe(false);
    expect(chart.priceScale("right", 1).options().invertScale).toBe(true);
  });

  it("keeps applying options after a pane above is removed", () => {
    const chartRef = createRef<ChartApiRef<Time, IChartApi>>();
    const nextOptions = { scaleMargins: { top: 0.3, bottom: 0.1 } };
    const TwoPanes = ({
      showFirst,
      options,
    }: {
      showFirst: boolean;
      options: object;
    }) => (
      <Chart ref={chartRef} options={chartOptions}>
        {showFirst && (
          <Pane key="first">
            <LineSeries data={data} />
          </Pane>
        )}
        <Pane key="second">
          <LineSeries data={data} />
          <PriceScale id="right" options={options} />
        </Pane>
      </Chart>
    );

    const { rerender } = render(<TwoPanes showFirst options={overlayOptions} />);
    rerender(<TwoPanes showFirst={false} options={overlayOptions} />);
    rerender(<TwoPanes showFirst={false} options={nextOptions} />);

    const chart = chartRef.current!.api()!;
    expect(chart.panes()).toHaveLength(1);
    expect(chart.priceScale("right", 0).options().scaleMargins).toEqual(
      nextOptions.scaleMargins
    );
  });

  it("follows a nested overlay price scale when its id changes", () => {
    const chartRef = createRef<ChartApiRef<Time, IChartApi>>();
    const Overlay = ({ scaleId }: { scaleId: string }) => (
      <Chart ref={chartRef} options={chartOptions}>
        <Pane>
          <LineSeries data={data} />
          <HistogramSeries data={data} options={{ priceScaleId: scaleId }}>
            <PriceScale id={scaleId} options={overlayOptions} />
          </HistogramSeries>
        </Pane>
      </Chart>
    );

    const { rerender } = render(<Overlay scaleId="volume" />);
    rerender(<Overlay scaleId="other" />);

    const chart = chartRef.current!.api()!;
    expect(chart.priceScale("other", 0).options().scaleMargins).toEqual(
      overlayOptions.scaleMargins
    );
  });

  it("binds a nested PriceScale mounted while its series switches to that scale", () => {
    const chartRef = createRef<ChartApiRef<Time, IChartApi>>();
    const Volume = ({ overlay }: { overlay: boolean }) => (
      <Chart ref={chartRef} options={chartOptions}>
        <Pane>
          <LineSeries data={data} />
          <HistogramSeries
            data={data}
            options={{ priceScaleId: overlay ? "volume" : "right" }}
          >
            {overlay && <PriceScale id="volume" options={overlayOptions} />}
          </HistogramSeries>
        </Pane>
      </Chart>
    );

    const { rerender } = render(<Volume overlay={false} />);
    rerender(<Volume overlay />);

    const chart = chartRef.current!.api()!;
    expect(chart.priceScale("volume", 0).options().scaleMargins).toEqual(
      overlayOptions.scaleMargins
    );
  });
});
