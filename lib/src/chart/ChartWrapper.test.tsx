import { render } from "@testing-library/react";
import { createChartEx } from "lightweight-charts";
import React from "react";
import { beforeEach, describe, it, expect, vi } from "vitest";
import { ChartComponent } from "./ChartComponent";
import { ChartWrapper } from "./ChartWrapper";
import { CustomChart } from "./CustomChart";
import { OptionsChart } from "./OptionsChart";
import { YieldCurveChart } from "./YieldCurveChart";

vi.mock("lightweight-charts", () => ({
  createChart: vi.fn(),
  createChartEx: vi.fn(),
  createOptionsChart: vi.fn(),
  createYieldCurveChart: vi.fn(),
}));

vi.mock("./ChartComponent", () => ({
  ChartComponent: vi.fn(({ children }) => <>{children}</>),
}));

describe("ChartWrapper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when container is set", () => {
    const { getByText } = render(
      <ChartWrapper>
        <div>Chart Content</div>
      </ChartWrapper>
    );

    const child = getByText("Chart Content");
    expect(child).toBeInTheDocument();
  });

  it("forwards the ref correctly", () => {
    const ref = { current: null };
    render(
      <ChartWrapper ref={ref}>
        <div>Child</div>
      </ChartWrapper>
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("forwards function refs on ChartWrapper", () => {
    const ref = vi.fn();
    render(
      <ChartWrapper ref={ref}>
        <div>Child</div>
      </ChartWrapper>
    );

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it("handles containerProps correctly", () => {
    const { getByRole } = render(
      <ChartWrapper containerProps={{ role: "main" }}>
        <div>Child</div>
      </ChartWrapper>
    );

    const containerDiv = getByRole("main", { hidden: true });
    expect(containerDiv).toBeInTheDocument();
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

  it("passes options chart constructor metadata to ChartComponent", () => {
    render(
      <OptionsChart>
        <div>Child</div>
      </OptionsChart>
    );

    expect(vi.mocked(ChartComponent)).toHaveBeenCalledWith(
      expect.objectContaining({
        chartKind: "options",
        createChartApi: expect.any(Function),
      }),
      undefined
    );
  });

  it("forwards object refs on OptionsChart", () => {
    const ref = { current: null };
    render(
      <OptionsChart ref={ref}>
        <div>Child</div>
      </OptionsChart>
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("forwards function refs on OptionsChart", () => {
    const ref = vi.fn();
    render(
      <OptionsChart ref={ref}>
        <div>Child</div>
      </OptionsChart>
    );

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
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

  it("passes yield curve chart constructor metadata to ChartComponent", () => {
    render(
      <YieldCurveChart>
        <div>Child</div>
      </YieldCurveChart>
    );

    expect(vi.mocked(ChartComponent)).toHaveBeenCalledWith(
      expect.objectContaining({
        chartKind: "yield-curve",
        createChartApi: expect.any(Function),
      }),
      undefined
    );
  });

  it("forwards object refs on YieldCurveChart", () => {
    const ref = { current: null };
    render(
      <YieldCurveChart ref={ref}>
        <div>Child</div>
      </YieldCurveChart>
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("forwards function refs on YieldCurveChart", () => {
    const ref = vi.fn();
    render(
      <YieldCurveChart ref={ref}>
        <div>Child</div>
      </YieldCurveChart>
    );

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
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

  it("passes custom chart constructor metadata to ChartComponent", () => {
    render(
      <CustomChart horzScaleBehavior={{} as never}>
        <div>Child</div>
      </CustomChart>
    );

    expect(vi.mocked(ChartComponent)).toHaveBeenCalledWith(
      expect.objectContaining({
        chartKind: "custom",
        createChartApi: expect.any(Function),
      }),
      undefined
    );
  });

  it("forwards object refs on CustomChart", () => {
    const ref = { current: null };
    render(
      <CustomChart horzScaleBehavior={{} as never} ref={ref}>
        <div>Child</div>
      </CustomChart>
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("forwards function refs on CustomChart", () => {
    const ref = vi.fn();
    render(
      <CustomChart horzScaleBehavior={{} as never} ref={ref}>
        <div>Child</div>
      </CustomChart>
    );

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
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

  it("delegates custom chart creation to createChartEx", () => {
    const horzScaleBehavior = { options: vi.fn() } as never;
    render(
      <CustomChart horzScaleBehavior={horzScaleBehavior}>
        <div>Child</div>
      </CustomChart>
    );

    const createChartApi = vi.mocked(ChartComponent).mock.calls.at(-1)?.[0]
      .createChartApi as (container: HTMLElement, options?: object) => unknown;
    const container = document.createElement("div");
    const options = { layout: { backgroundColor: "red" } };

    createChartApi(container, options);

    expect(createChartEx).toHaveBeenCalledWith(container, horzScaleBehavior, options);
  });
});
