import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSafeContext } from "@/_shared/useSafeContext";
import { usePaneContext } from "@/pane/usePaneContext";
import { useSeries } from "./useSeries";
import type { SeriesTemplateProps } from "./types";
import type { ICustomSeriesPaneView } from "lightweight-charts";

vi.mock("@/_shared/useSafeContext");
vi.mock("@/pane/usePaneContext", () => ({
  usePaneContext: vi.fn().mockReturnValue({
    paneApiRef: undefined,
    isPaneReady: true,
    isInsidePane: false,
  }),
}));

const mockApplyOptions = vi.fn();
const mockAddSeries = vi.fn().mockReturnValue({
  setData: vi.fn(),
  applyOptions: mockApplyOptions,
});
const mockRemoveSeries = vi.fn();
const mockAddCustomSeries = vi.fn().mockReturnValue({
  setData: vi.fn(),
  applyOptions: mockApplyOptions,
});

const mockChart = {
  api: () => ({
    addSeries: mockAddSeries,
    removeSeries: mockRemoveSeries,
    addCustomSeries: mockAddCustomSeries,
  }),
};

describe("useSeries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create series", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const { result } = renderHook(() =>
      useSeries({
        type: "Line",
        data: [],
      })
    );

    const api = result.current.seriesApiRef.current.api();
    expect(api).toBeDefined();
    expect(mockAddSeries).toHaveBeenCalled();
    expect(mockAddCustomSeries).not.toHaveBeenCalled();
  });

  it("should create custom series", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const { result } = renderHook(() =>
      useSeries({
        type: "Custom",
        data: [],
        plugin: {} as ICustomSeriesPaneView,
      })
    );

    const api = result.current.seriesApiRef.current.api();
    expect(api).toBeDefined();
    expect(mockAddCustomSeries).toHaveBeenCalled();
    expect(mockAddSeries).not.toHaveBeenCalled();
  });

  it("should clear the series on unmount", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const { unmount } = renderHook(() =>
      useSeries({
        type: "Line",
        data: [],
      })
    );

    unmount();

    expect(mockRemoveSeries).toHaveBeenCalled();
  });

  it("should not create series if not ready", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: false,
    });

    const { result } = renderHook(() =>
      useSeries({
        type: "Line",
        data: [],
      })
    );

    const api = result.current.seriesApiRef.current.api();
    expect(api).toBeNull();
    expect(mockAddSeries).not.toHaveBeenCalled();
  });

  it("should not create series if no chartApiRef", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: null,
      isReady: true,
    });

    const { result } = renderHook(() =>
      useSeries({
        type: "Line",
        data: [],
      })
    );

    const api = result.current.seriesApiRef.current.api();
    expect(api).toBeNull();
    expect(mockAddSeries).not.toHaveBeenCalled();
  });

  it("should apply options to the series", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const { rerender } = renderHook(
      (props: SeriesTemplateProps<"Line">) => useSeries(props),
      {
        initialProps: {
          type: "Line",
          data: [],
          options: { color: "red" },
        },
      }
    );

    expect(mockApplyOptions).toHaveBeenCalledWith({ color: "red" });

    rerender({
      type: "Line",
      data: [],
      options: { color: "blue" },
    });

    expect(mockApplyOptions).toHaveBeenCalledWith({ color: "blue" });
  });

  it("should not create series if inside pane and pane is not ready", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });
    vi.mocked(usePaneContext).mockReturnValue({
      paneApiRef: undefined,
      isPaneReady: false,
      isInsidePane: true,
    });

    const { result } = renderHook(() =>
      useSeries({
        type: "Line",
        data: [],
      })
    );

    const api = result.current.seriesApiRef.current.api();
    expect(api).toBeNull();
    expect(mockAddSeries).not.toHaveBeenCalled();
  });

  it("should create series if inside pane and pane is ready", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });
    vi.mocked(usePaneContext).mockReturnValue({
      paneApiRef: undefined,
      isPaneReady: true,
      isInsidePane: true,
    });

    const { result } = renderHook(() =>
      useSeries({
        type: "Line",
        data: [],
      })
    );

    const api = result.current.seriesApiRef.current.api();
    expect(api).toBeDefined();
    expect(mockAddSeries).toHaveBeenCalled();
  });

  it("in custom series should throw error if plugin is not provided", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    expect(() =>
      renderHook(() =>
        useSeries({
          type: "Custom",
          data: [],
        })
      )
    ).toThrow("Custom series requires a plugin to be defined");
  });
});
