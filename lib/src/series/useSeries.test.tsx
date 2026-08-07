import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BaseInternalError } from "@/_shared/InternalError";
import { useSafeContext } from "@/_shared/useSafeContext";
import { usePaneContext } from "@/pane/usePaneContext";
import { useSeries } from "./useSeries";
import type { SeriesTemplateProps } from "./types";
import type { BusinessDay, ICustomSeriesPaneView } from "lightweight-charts";

vi.mock("@/_shared/useSafeContext");
vi.mock("@/pane/usePaneContext", () => ({
  usePaneContext: vi.fn().mockReturnValue({
    paneApiRef: undefined,
    isPaneReady: true,
    isInsidePane: false,
  }),
}));

type MockSeriesDataPoint = {
  time: string | BusinessDay;
  value?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
};

let currentSeriesData: MockSeriesDataPoint[] = [];

const mockApplyOptions = vi.fn();
const mockSetSeriesOrder = vi.fn();
const mockSetData = vi.fn((data: typeof currentSeriesData) => {
  currentSeriesData = data;
});
const mockUpdate = vi.fn((dataPoint: (typeof currentSeriesData)[number]) => {
  const lastDataPoint = currentSeriesData[currentSeriesData.length - 1];

  if (!lastDataPoint || lastDataPoint.time !== dataPoint.time) {
    currentSeriesData = [...currentSeriesData, dataPoint];
    return;
  }

  currentSeriesData = [...currentSeriesData.slice(0, -1), dataPoint];
});
const mockGetData = vi.fn(() => currentSeriesData);
const mockAddSeries = vi.fn().mockReturnValue({
  update: mockUpdate,
  data: mockGetData,
  setData: mockSetData,
  applyOptions: mockApplyOptions,
  setSeriesOrder: mockSetSeriesOrder,
});
const mockRemoveSeries = vi.fn();
const mockAddCustomSeries = vi.fn().mockReturnValue({
  data: vi.fn().mockReturnValue([]),
  setData: mockSetData,
  applyOptions: mockApplyOptions,
  setSeriesOrder: mockSetSeriesOrder,
});

const mockChart = {
  api: () => ({
    addSeries: mockAddSeries,
    removeSeries: mockRemoveSeries,
    addCustomSeries: mockAddCustomSeries,
  }),
};

const captureHookError = (callback: () => void) => {
  try {
    callback();
  } catch (error) {
    return error as BaseInternalError;
  }

  throw new Error("Expected renderHook to throw");
};

describe("useSeries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentSeriesData = [];
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

  it("tracks readiness transitions while creating and clearing a series", () => {
    const readinessStates: boolean[] = [];

    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const { result } = renderHook(() => {
      const series = useSeries({
        type: "Line",
        data: [],
      });

      readinessStates.push(series.isReady);

      return series;
    });

    expect(result.current.isReady).toBe(true);
    expect(readinessStates[0]).toBe(false);
    expect(readinessStates).toContain(true);

    act(() => {
      result.current.seriesApiRef.current.clear();
    });

    expect(result.current.seriesApiRef.current.api()).toBeNull();
    expect(result.current.isReady).toBe(false);
    expect(readinessStates.at(-1)).toBe(false);
    expect(mockRemoveSeries).toHaveBeenCalledTimes(1);
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

  it("returns the existing series instance when init is called again", () => {
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

    const api = result.current.seriesApiRef.current.init();

    expect(api).toBe(result.current.seriesApiRef.current.api());
    expect(mockAddSeries).toHaveBeenCalledTimes(1);
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

  it("initializes once the chart becomes ready", () => {
    const chartContext = {
      chartApiRef: mockChart,
      isReady: false,
    };

    vi.mocked(useSafeContext).mockImplementation(() => chartContext);

    const { result, rerender } = renderHook(() =>
      useSeries({
        type: "Line",
        data: [],
      })
    );

    expect(result.current.seriesApiRef.current.api()).toBeNull();
    expect(mockAddSeries).not.toHaveBeenCalled();

    chartContext.isReady = true;
    rerender();

    expect(result.current.seriesApiRef.current.api()).toBeDefined();
    expect(mockAddSeries).toHaveBeenCalledTimes(1);
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

  it("throws for unsupported yield curve series types", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
      chartKind: "yield-curve",
    });

    const error = captureHookError(() =>
      renderHook(() =>
        useSeries({
          type: "Candlestick",
          data: [],
        })
      )
    );

    expect(error).toBeInstanceOf(BaseInternalError);
    expect(error.isOperational).toBe(true);
    expect(error.message).toContain(
      "YieldCurveChart only supports LineSeries and AreaSeries."
    );
    expect(error.message).not.toContain("Docs:");
  });

  it("allows non-yield-curve charts to use Candlestick series", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
      chartKind: "standard",
    });

    renderHook(() =>
      useSeries({
        type: "Candlestick",
        data: [],
      })
    );

    expect(mockAddSeries).toHaveBeenCalledTimes(1);
  });

  it.each(["Line", "Area"] as const)("allows %s series on yield curve charts", type => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
      chartKind: "yield-curve",
    });

    renderHook(() =>
      useSeries({
        type,
        data: [],
      })
    );

    expect(mockAddSeries).toHaveBeenCalledTimes(1);
    expect(mockAddCustomSeries).not.toHaveBeenCalled();
  });

  it("does not set a series order when the prop is omitted", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    renderHook(() =>
      useSeries({
        type: "Line",
        data: [],
      })
    );

    expect(mockSetSeriesOrder).not.toHaveBeenCalled();
  });

  it("should set series order if provided", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    renderHook(() =>
      useSeries({
        type: "Line",
        data: [],
        seriesOrder: 1,
      })
    );

    expect(mockSetSeriesOrder).toHaveBeenCalledWith(1);
    expect(mockSetSeriesOrder).toHaveBeenLastCalledWith(1);
    expect(mockSetSeriesOrder.mock.calls.length).toBeGreaterThan(1);
  });

  it("updates series order when the prop changes", () => {
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
        },
      }
    );

    expect(mockSetSeriesOrder).not.toHaveBeenCalled();

    rerender({
      type: "Line",
      data: [],
      seriesOrder: 2,
    });

    expect(mockSetSeriesOrder).toHaveBeenCalledTimes(1);
    expect(mockSetSeriesOrder).toHaveBeenCalledWith(2);
  });

  it("uses reactive updates by default", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const existingData = [{ time: "2023-01-01", value: 200 }];
    const newData = { time: "2023-01-02", value: 250 };

    const { rerender } = renderHook(
      (props: SeriesTemplateProps<"Line">) => useSeries(props),
      {
        initialProps: {
          type: "Line",
          data: existingData,
        },
      }
    );

    mockUpdate.mockClear();
    mockSetData.mockClear();

    rerender({
      type: "Line",
      data: [...existingData, newData],
    });

    expect(mockUpdate).toHaveBeenCalledWith(newData);
    expect(mockSetData).not.toHaveBeenCalled();
  });

  it("does not perform reactive updates when reactive is false", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const existingData = [{ time: "2023-01-01", value: 200 }];
    const nextData = [...existingData, { time: "2023-01-02", value: 250 }];

    const { rerender } = renderHook(
      (props: SeriesTemplateProps<"Line">) => useSeries(props),
      {
        initialProps: {
          type: "Line",
          data: existingData,
          reactive: false,
        },
      }
    );

    mockUpdate.mockClear();
    mockSetData.mockClear();

    rerender({
      type: "Line",
      data: nextData,
      reactive: false,
    });

    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockSetData).not.toHaveBeenCalled();
  });

  it("uses update() when appending a new last bar", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const existingData = [{ time: "2023-01-01", value: 200 }];
    const newData = { time: "2023-01-02", value: 200 };

    const { rerender } = renderHook(
      (props: SeriesTemplateProps<"Line">) => useSeries(props),
      {
        initialProps: {
          type: "Line",
          data: existingData,
          reactive: true,
        },
      }
    );

    mockUpdate.mockClear();
    mockSetData.mockClear();

    rerender({
      type: "Line",
      data: [...existingData, newData],
      reactive: true,
    });

    expect(mockUpdate).toHaveBeenCalledWith(newData);
    expect(mockSetData).not.toHaveBeenCalled();
  });

  it("uses update() when only the last bar changes", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const sharedFirstDataPoint = { time: "2023-01-01", value: 100 };
    const existingData = [sharedFirstDataPoint, { time: "2023-01-02", value: 200 }];
    const updatedLastDataPoint = { time: "2023-01-02", value: 250 };

    const { rerender } = renderHook(
      (props: SeriesTemplateProps<"Line">) => useSeries(props),
      {
        initialProps: {
          type: "Line",
          data: existingData,
          reactive: true,
        },
      }
    );

    mockUpdate.mockClear();
    mockSetData.mockClear();

    rerender({
      type: "Line",
      data: [sharedFirstDataPoint, updatedLastDataPoint],
      reactive: true,
    });

    expect(mockUpdate).toHaveBeenCalledWith(updatedLastDataPoint);
    expect(mockSetData).not.toHaveBeenCalled();
  });

  it("uses update() when only the last BusinessDay bar changes", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const sharedFirstDataPoint = { time: "2023-01-01", value: 100 };
    const existingData = [
      sharedFirstDataPoint,
      { time: { year: 2023, month: 1, day: 2 }, value: 200 },
    ];
    const updatedLastDataPoint = {
      time: { year: 2023, month: 1, day: 2 },
      value: 250,
    };

    const { rerender } = renderHook(
      (props: SeriesTemplateProps<"Line">) => useSeries(props),
      {
        initialProps: {
          type: "Line",
          data: existingData,
          reactive: true,
        },
      }
    );

    mockUpdate.mockClear();
    mockSetData.mockClear();

    rerender({
      type: "Line",
      data: [sharedFirstDataPoint, updatedLastDataPoint],
      reactive: true,
    });

    expect(mockUpdate).toHaveBeenCalledWith(updatedLastDataPoint);
    expect(mockSetData).not.toHaveBeenCalled();
  });

  it("uses setData() when reactive data shrinks", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const existingData = [
      { time: "2023-01-01", value: 100 },
      { time: "2023-01-02", value: 200 },
    ];
    const nextData = [{ time: "2023-01-01", value: 150 }];

    const { rerender } = renderHook(
      (props: SeriesTemplateProps<"Line">) => useSeries(props),
      {
        initialProps: {
          type: "Line",
          data: existingData,
          reactive: true,
        },
      }
    );

    mockSetData.mockClear();

    rerender({
      type: "Line",
      data: nextData,
      reactive: true,
    });

    expect(mockSetData).toHaveBeenCalledWith(nextData);
  });

  it("uses setData() when appending to an empty series", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const nextData = [{ time: "2023-01-01", value: 100 }];

    const { rerender } = renderHook(
      (props: SeriesTemplateProps<"Line">) => useSeries(props),
      {
        initialProps: {
          type: "Line",
          data: [],
          reactive: true,
        },
      }
    );

    mockSetData.mockClear();
    mockUpdate.mockClear();

    rerender({
      type: "Line",
      data: nextData,
      reactive: true,
    });

    expect(mockSetData).toHaveBeenCalledWith(nextData);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("uses setData() when reactive data becomes empty", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const existingData = [{ time: "2023-01-01", value: 100 }];

    const { rerender } = renderHook(
      (props: SeriesTemplateProps<"Line">) => useSeries(props),
      {
        initialProps: {
          type: "Line",
          data: existingData,
          reactive: true,
        },
      }
    );

    mockSetData.mockClear();
    mockUpdate.mockClear();

    rerender({
      type: "Line",
      data: [],
      reactive: true,
    });

    expect(mockSetData).toHaveBeenCalledWith([]);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("uses setData() when replacing historical data with the same length", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const existingData = [
      { time: "2023-01-01", value: 100 },
      { time: "2023-01-02", value: 200 },
    ];
    const nextData = [
      { time: "2023-01-01", value: 150 },
      { time: "2023-01-02", value: 250 },
    ];

    const { rerender } = renderHook(
      (props: SeriesTemplateProps<"Line">) => useSeries(props),
      {
        initialProps: {
          type: "Line",
          data: existingData,
          reactive: true,
        },
      }
    );

    mockSetData.mockClear();
    mockUpdate.mockClear();

    rerender({
      type: "Line",
      data: nextData,
      reactive: true,
    });

    expect(mockSetData).toHaveBeenCalledWith(nextData);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("uses setData() when appending while also changing the previous last bar", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const existingData = [{ time: "2023-01-01", value: 200 }];
    const nextData = [
      { time: "2023-01-01", value: 100 },
      { time: "2023-01-02", value: 200 },
    ];

    const { rerender } = renderHook(
      (props: SeriesTemplateProps<"Line">) => useSeries(props),
      {
        initialProps: {
          type: "Line",
          data: existingData,
          reactive: true,
        },
      }
    );

    mockSetData.mockClear();
    mockUpdate.mockClear();

    rerender({
      type: "Line",
      data: nextData,
      reactive: true,
    });

    expect(mockSetData).toHaveBeenCalledWith(nextData);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("uses setData() when more than one point is appended", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const existingData = [{ time: "2023-01-01", value: 100 }];
    const nextData = [
      ...existingData,
      { time: "2023-01-02", value: 150 },
      { time: "2023-01-03", value: 200 },
    ];

    const { rerender } = renderHook(
      (props: SeriesTemplateProps<"Line">) => useSeries(props),
      {
        initialProps: {
          type: "Line",
          data: existingData,
          reactive: true,
        },
      }
    );

    mockSetData.mockClear();
    mockUpdate.mockClear();

    rerender({
      type: "Line",
      data: nextData,
      reactive: true,
    });

    expect(mockSetData).toHaveBeenCalledWith(nextData);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("uses setData() when an appended BusinessDay matches the previous last date", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const existingLastDataPoint = {
      time: { year: 2023, month: 1, day: 1 },
      value: 200,
    };
    const nextData = [
      existingLastDataPoint,
      { time: { year: 2023, month: 1, day: 1 }, value: 250 },
    ];

    const { rerender } = renderHook(
      (props: SeriesTemplateProps<"Line">) => useSeries(props),
      {
        initialProps: {
          type: "Line",
          data: [existingLastDataPoint],
          reactive: true,
        },
      }
    );

    mockSetData.mockClear();
    mockUpdate.mockClear();

    rerender({
      type: "Line",
      data: nextData,
      reactive: true,
    });

    expect(mockSetData).toHaveBeenCalledWith(nextData);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it.each([
    [{ year: 2024, month: 1, day: 2 }, "year"],
    [{ year: 2023, month: 2, day: 2 }, "month"],
    [{ year: 2023, month: 1, day: 3 }, "day"],
  ] as const)(
    "uses setData() when a BusinessDay differs by %s",
    (nextBusinessDay, _label) => {
      vi.mocked(useSafeContext).mockReturnValue({
        chartApiRef: mockChart,
        isReady: true,
      });

      const sharedFirstDataPoint = { time: "2023-01-01", value: 100 };
      const existingData = [
        sharedFirstDataPoint,
        { time: { year: 2023, month: 1, day: 2 }, value: 200 },
      ];
      const nextData = [
        sharedFirstDataPoint,
        {
          time: nextBusinessDay,
          value: 250,
        },
      ];

      const { rerender } = renderHook(
        (props: SeriesTemplateProps<"Line">) => useSeries(props),
        {
          initialProps: {
            type: "Line",
            data: existingData,
            reactive: true,
          },
        }
      );

      mockSetData.mockClear();
      mockUpdate.mockClear();

      rerender({
        type: "Line",
        data: nextData,
        reactive: true,
      });

      expect(mockSetData).toHaveBeenCalledWith(nextData);
      expect(mockUpdate).not.toHaveBeenCalled();
    }
  );
});
