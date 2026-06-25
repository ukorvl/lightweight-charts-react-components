import { render } from "@testing-library/react";
import {
  createChart,
  createChartEx,
  createOptionsChart,
  createYieldCurveChart,
  type IChartApi,
  type IChartApiBase,
  type IYieldCurveChartApi,
  type Time,
} from "lightweight-charts";
import { createRef } from "react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChartWrapper } from "./ChartWrapper";
import { CustomChart } from "./CustomChart";
import { OptionsChart } from "./OptionsChart";
import { YieldCurveChart } from "./YieldCurveChart";
import type { ChartApiRef } from "./types";

vi.mock("lightweight-charts", () => ({
  createChart: vi.fn(),
  createChartEx: vi.fn(),
  createOptionsChart: vi.fn(),
  createYieldCurveChart: vi.fn(),
}));

const mockChart = {
  remove: vi.fn(),
  applyOptions: vi.fn(),
  subscribeClick: vi.fn(),
  unsubscribeClick: vi.fn(),
  subscribeCrosshairMove: vi.fn(),
  unsubscribeCrosshairMove: vi.fn(),
  subscribeDblClick: vi.fn(),
  unsubscribeDblClick: vi.fn(),
} as unknown as IChartApi;
const mockOptionsChart = mockChart as unknown as IChartApiBase<number>;
const mockYieldCurveChart = mockChart as unknown as IYieldCurveChartApi;
const mockCustomChart = mockChart as unknown as IChartApiBase<unknown>;

describe("ChartWrapper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createChart).mockReturnValue(mockChart);
    vi.mocked(createOptionsChart).mockReturnValue(mockOptionsChart);
    vi.mocked(createYieldCurveChart).mockReturnValue(mockYieldCurveChart);
    vi.mocked(createChartEx).mockReturnValue(mockCustomChart);
  });

  it("renders children when container is set", () => {
    const { getByText } = render(
      <ChartWrapper>
        <div>Chart Content</div>
      </ChartWrapper>
    );

    expect(getByText("Chart Content")).toBeInTheDocument();
  });

  it("forwards chart api object refs on ChartWrapper", () => {
    const ref = createRef<ChartApiRef<Time, IChartApi>>();

    render(
      <ChartWrapper ref={ref}>
        <div>Child</div>
      </ChartWrapper>
    );

    expect(ref.current?.api()).toBe(mockChart);
  });

  it("forwards chart api function refs on ChartWrapper", () => {
    const ref = vi.fn();

    render(
      <ChartWrapper ref={ref}>
        <div>Child</div>
      </ChartWrapper>
    );

    expect(ref).toHaveBeenCalledWith(
      expect.objectContaining({
        api: expect.any(Function),
      })
    );
  });

  it("forwards object container refs on ChartWrapper", () => {
    const containerRef = createRef<HTMLDivElement>();

    render(
      <ChartWrapper containerRef={containerRef}>
        <div>Child</div>
      </ChartWrapper>
    );

    expect(containerRef.current).toBeInstanceOf(HTMLDivElement);
  });

  it("forwards function container refs on ChartWrapper", () => {
    const containerRef = vi.fn();

    render(
      <ChartWrapper containerRef={containerRef}>
        <div>Child</div>
      </ChartWrapper>
    );

    expect(containerRef).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it("handles containerProps correctly", () => {
    const { getByRole } = render(
      <ChartWrapper containerProps={{ role: "main" }}>
        <div>Child</div>
      </ChartWrapper>
    );

    expect(getByRole("main", { hidden: true })).toBeInTheDocument();
  });

  it("hides chart containers from the accessibility tree by default", () => {
    const { container } = render(
      <ChartWrapper>
        <div>Child</div>
      </ChartWrapper>
    );

    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("allows overriding default chart container accessibility props", () => {
    const { container } = render(
      <ChartWrapper
        containerProps={{ "aria-hidden": false, "aria-label": "Price chart" }}
      >
        <div>Child</div>
      </ChartWrapper>
    );

    expect(container.firstChild).toHaveAttribute("aria-hidden", "false");
    expect(container.firstChild).toHaveAttribute("aria-label", "Price chart");
  });

  it("creates options charts with createOptionsChart", () => {
    render(
      <OptionsChart>
        <div>Child</div>
      </OptionsChart>
    );

    expect(createOptionsChart).toHaveBeenCalledWith(expect.any(HTMLDivElement), {
      addDefaultPane: false,
    });
  });

  it("forwards chart api object refs on OptionsChart", () => {
    const ref = createRef<ChartApiRef<number, IChartApiBase<number>>>();

    render(
      <OptionsChart ref={ref}>
        <div>Child</div>
      </OptionsChart>
    );

    expect(ref.current?.api()).toBe(mockChart);
  });

  it("forwards container refs on OptionsChart", () => {
    const containerRef = createRef<HTMLDivElement>();

    render(
      <OptionsChart containerRef={containerRef}>
        <div>Child</div>
      </OptionsChart>
    );

    expect(containerRef.current).toBeInstanceOf(HTMLDivElement);
  });

  it("hides OptionsChart containers from the accessibility tree by default", () => {
    const { container } = render(
      <OptionsChart>
        <div>Child</div>
      </OptionsChart>
    );

    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("allows overriding OptionsChart container accessibility props", () => {
    const { container } = render(
      <OptionsChart
        containerProps={{ "aria-hidden": false, "aria-label": "Options chart" }}
      >
        <div>Child</div>
      </OptionsChart>
    );

    expect(container.firstChild).toHaveAttribute("aria-hidden", "false");
    expect(container.firstChild).toHaveAttribute("aria-label", "Options chart");
  });

  it("creates yield curve charts with createYieldCurveChart", () => {
    render(
      <YieldCurveChart>
        <div>Child</div>
      </YieldCurveChart>
    );

    expect(createYieldCurveChart).toHaveBeenCalledWith(expect.any(HTMLDivElement), {
      addDefaultPane: false,
    });
  });

  it("forwards chart api object refs on YieldCurveChart", () => {
    const ref = createRef<ChartApiRef<number, IYieldCurveChartApi>>();

    render(
      <YieldCurveChart ref={ref}>
        <div>Child</div>
      </YieldCurveChart>
    );

    expect(ref.current?.api()).toBe(mockChart);
  });

  it("forwards container refs on YieldCurveChart", () => {
    const containerRef = createRef<HTMLDivElement>();

    render(
      <YieldCurveChart containerRef={containerRef}>
        <div>Child</div>
      </YieldCurveChart>
    );

    expect(containerRef.current).toBeInstanceOf(HTMLDivElement);
  });

  it("hides YieldCurveChart containers from the accessibility tree by default", () => {
    const { container } = render(
      <YieldCurveChart>
        <div>Child</div>
      </YieldCurveChart>
    );

    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("allows overriding YieldCurveChart container accessibility props", () => {
    const { container } = render(
      <YieldCurveChart
        containerProps={{ "aria-hidden": false, "aria-label": "Yield curve chart" }}
      >
        <div>Child</div>
      </YieldCurveChart>
    );

    expect(container.firstChild).toHaveAttribute("aria-hidden", "false");
    expect(container.firstChild).toHaveAttribute("aria-label", "Yield curve chart");
  });

  it("delegates custom chart creation to createChartEx", () => {
    const horzScaleBehavior = { options: vi.fn() } as never;

    render(
      <CustomChart horzScaleBehavior={horzScaleBehavior}>
        <div>Child</div>
      </CustomChart>
    );

    expect(createChartEx).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      horzScaleBehavior,
      {
        addDefaultPane: false,
      }
    );
  });

  it("forwards chart api object refs on CustomChart", () => {
    const ref = createRef<ChartApiRef<Time, IChartApiBase<Time>>>();

    render(
      <CustomChart horzScaleBehavior={{} as never} ref={ref}>
        <div>Child</div>
      </CustomChart>
    );

    expect(ref.current?.api()).toBe(mockChart);
  });

  it("forwards container refs on CustomChart", () => {
    const containerRef = createRef<HTMLDivElement>();

    render(
      <CustomChart horzScaleBehavior={{} as never} containerRef={containerRef}>
        <div>Child</div>
      </CustomChart>
    );

    expect(containerRef.current).toBeInstanceOf(HTMLDivElement);
  });

  it("hides CustomChart containers from the accessibility tree by default", () => {
    const { container } = render(
      <CustomChart horzScaleBehavior={{} as never}>
        <div>Child</div>
      </CustomChart>
    );

    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("allows overriding CustomChart container accessibility props", () => {
    const { container } = render(
      <CustomChart
        horzScaleBehavior={{} as never}
        containerProps={{ "aria-hidden": false, "aria-label": "Custom chart" }}
      >
        <div>Child</div>
      </CustomChart>
    );

    expect(container.firstChild).toHaveAttribute("aria-hidden", "false");
    expect(container.firstChild).toHaveAttribute("aria-label", "Custom chart");
  });
});
