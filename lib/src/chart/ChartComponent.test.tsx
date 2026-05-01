import { render } from "@testing-library/react";
import { useContext } from "react";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChartComponent } from "./ChartComponent";
import { ChartContext } from "./ChartContext";
import * as useChartModule from "./useChart";
import type { ContextType } from "react";

vi.mock("./useChart");

const mockContainer = document.createElement("div");

describe("Chart component", () => {
  const mockApiRef = {
    api: vi.fn(),
    init: vi.fn(),
    clear: vi.fn(),
    _chart: null,
  };

  beforeEach(() => {
    vi.mocked(useChartModule.useChart).mockReturnValue({
      chartApiRef: {
        current: mockApiRef,
      },
      isReady: true,
    });
  });

  it("renders children", () => {
    const { getByText } = render(
      <ChartComponent container={mockContainer}>
        <div>Child Content</div>
      </ChartComponent>
    );

    expect(getByText("Child Content")).toBeInTheDocument();
  });

  it("provides chartApiRef and isReady via context", () => {
    let contextValue: ContextType<typeof ChartContext> = null;

    const Consumer = () => {
      contextValue = useContext(ChartContext);
      return null;
    };

    render(
      <ChartComponent container={mockContainer}>
        <Consumer />
      </ChartComponent>
    );

    expect(contextValue).toEqual({
      chartApiRef: mockApiRef,
      isReady: true,
      chartKind: "time",
    });
  });

  it("calls useChart with correct parameters", () => {
    const mockUseChart = vi.mocked(useChartModule.useChart);
    render(
      <ChartComponent
        container={mockContainer}
        options={{}}
        onInit={vi.fn()}
        onDblClick={vi.fn()}
      >
        <div>Child Content</div>
      </ChartComponent>
    );

    expect(mockUseChart).toHaveBeenLastCalledWith({
      container: mockContainer,
      onClick: undefined,
      onCrosshairMove: undefined,
      options: {},
      onInit: expect.any(Function),
      onDblClick: expect.any(Function),
      createChartApi: undefined,
    });
  });
});
