import { render } from "@testing-library/react";
import { createRef, useContext } from "react";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SeriesContext } from "./SeriesContext";
import { SeriesTemplate } from "./SeriesTemplate";
import * as useSeriesModule from "./useSeries";
import type { SeriesApiRef } from "./types";

vi.mock("./useSeries");

describe("SeriesTemplate component", () => {
  const mockApiRef = {
    api: vi.fn(),
    init: vi.fn(),
    clear: vi.fn(),
    _series: null,
  };

  beforeEach(() => {
    vi.mocked(useSeriesModule.useSeries).mockReturnValue({
      seriesApiRef: {
        current: mockApiRef,
      },
      isReady: true,
    });
  });

  it("forwards ref in SeriesTemplate component", () => {
    const ref = createRef<SeriesApiRef<"Line">>();
    render(<SeriesTemplate ref={ref} type="Line" data={[]} />);

    expect(ref.current).toBe(mockApiRef);
  });

  it("does not render anything to the DOM", () => {
    const { container } = render(<SeriesTemplate type="Line" data={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders children", () => {
    const { getByText } = render(
      <SeriesTemplate type="Line" data={[]}>
        <div>Child Content</div>
      </SeriesTemplate>
    );

    expect(getByText("Child Content")).toBeInTheDocument();
  });

  it("provides seriesApiRef and isReady via context", () => {
    let contextValue = null;

    const Consumer = () => {
      contextValue = useContext(SeriesContext);
      return null;
    };

    render(
      <SeriesTemplate type="Line" data={[]}>
        <Consumer />
      </SeriesTemplate>
    );

    expect(contextValue).toEqual({
      seriesApiRef: mockApiRef,
      isReady: true,
    });
  });

  it("calls useSeries with correct parameters", () => {
    const mockUseSeries = vi.mocked(useSeriesModule.useSeries);
    render(<SeriesTemplate type="Line" data={[]} />);

    expect(mockUseSeries).toHaveBeenCalledWith({
      type: "Line",
      data: [],
      options: undefined,
    });
  });
});
