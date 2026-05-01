import { render } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { ChartComponent } from "./ChartComponent";
import { ChartWrapper } from "./ChartWrapper";
import { CustomChart } from "./CustomChart";
import { OptionsChart } from "./OptionsChart";
import { YieldCurveChart } from "./YieldCurveChart";

vi.mock("./ChartComponent", () => ({
  ChartComponent: vi.fn(({ children }) => <>{children}</>),
}));

describe("ChartWrapper", () => {
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

  it("handles containerProps correctly", () => {
    const { getByRole } = render(
      <ChartWrapper containerProps={{ role: "main" }}>
        <div>Child</div>
      </ChartWrapper>
    );

    const containerDiv = getByRole("main");
    expect(containerDiv).toBeInTheDocument();
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
});
