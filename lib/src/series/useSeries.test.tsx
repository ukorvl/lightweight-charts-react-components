import { act, renderHook } from "@testing-library/react";
import { defaultHorzScaleBehavior } from "lightweight-charts";
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
// Like lightweight-charts, data() copies every point into a new object on each call.
const mockGetData = vi.fn(() => currentSeriesData.map(dataPoint => ({ ...dataPoint })));
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

// The real time scale behavior, so reactive updates compare times the way the chart does.
const timeScaleBehavior = new (defaultHorzScaleBehavior())();
const mockChartApi = {
  addSeries: mockAddSeries,
  removeSeries: mockRemoveSeries,
  addCustomSeries: mockAddCustomSeries,
  horzBehaviour: () => timeScaleBehavior,
};

const mockChart = {
  api: () => mockChartApi,
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

  it("does not apply null options from JavaScript consumers", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    renderHook(() => useSeries({ type: "Line", data: [], options: null as never }));

    expect(mockApplyOptions).not.toHaveBeenCalled();
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
        // @ts-expect-error JavaScript consumers can omit the required plugin at runtime.
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

  it("uses update() when a string time replaces a BusinessDay for the same day", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const sharedFirstDataPoint = { time: { year: 2023, month: 1, day: 1 }, value: 100 };
    const existingData = [
      sharedFirstDataPoint,
      { time: { year: 2023, month: 1, day: 2 }, value: 200 },
    ];
    const updatedLastDataPoint = { time: "2023-01-02", value: 250 };

    const { rerender } = renderHook(
      (props: SeriesTemplateProps<"Line">) => useSeries(props),
      { initialProps: { type: "Line", data: existingData } }
    );

    mockSetData.mockClear();

    rerender({ type: "Line", data: [sharedFirstDataPoint, updatedLastDataPoint] });

    expect(mockUpdate).toHaveBeenCalledWith(updatedLastDataPoint);
    expect(mockSetData).not.toHaveBeenCalled();
  });

  it("uses setData() when an appended string time matches the previous BusinessDay", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const existingData = [{ time: { year: 2023, month: 1, day: 1 }, value: 100 }];
    const nextData = [...existingData, { time: "2023-01-01", value: 150 }];

    const { rerender } = renderHook(
      (props: SeriesTemplateProps<"Line">) => useSeries(props),
      { initialProps: { type: "Line", data: existingData } }
    );

    mockSetData.mockClear();

    rerender({ type: "Line", data: nextData });

    expect(mockSetData).toHaveBeenCalledWith(nextData);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("uses setData() when an appended point is older than the last one", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const existingData = [{ time: "2023-01-02", value: 100 }];
    const nextData = [...existingData, { time: "2023-01-01", value: 150 }];

    const { rerender } = renderHook(
      (props: SeriesTemplateProps<"Line">) => useSeries(props),
      { initialProps: { type: "Line", data: existingData } }
    );

    mockSetData.mockClear();

    rerender({ type: "Line", data: nextData });

    expect(mockSetData).toHaveBeenCalledWith(nextData);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  describe("with a custom horizontal scale", () => {
    // Items look like BusinessDay objects, but the scale keys them by slot.
    type SlotTime = { year: number; month: number; day: number; slot: number };
    const createSlotPoint = (slot: number, value = slot) => ({
      time: { year: 2023, month: 1, day: 1, slot },
      value,
    });
    const slotChart = {
      api: () => ({
        ...mockChartApi,
        horzBehaviour: () => ({ key: (time: SlotTime) => time.slot }),
      }),
    };

    type SlotPoint = ReturnType<typeof createSlotPoint>;

    it.each([
      [
        "replaces the last slot with another slot",
        ([first]: SlotPoint[]) => [first, createSlotPoint(300)],
        "setData",
      ],
      [
        "replaces the last slot with the same slot",
        ([first]: SlotPoint[]) => [first, createSlotPoint(200, 250)],
        "update",
      ],
      [
        "appends a later slot",
        (data: SlotPoint[]) => [...data, createSlotPoint(300)],
        "update",
      ],
    ] as const)("%s", (_label, getNextData, expectedCall) => {
      vi.mocked(useSafeContext).mockReturnValue({
        chartApiRef: slotChart,
        isReady: true,
      });

      const existingData = [createSlotPoint(100), createSlotPoint(200)];
      const nextData = getNextData(existingData);

      const { rerender } = renderHook(
        (props: SeriesTemplateProps<"Line", SlotTime>) => useSeries(props),
        { initialProps: { type: "Line", data: existingData } }
      );

      mockSetData.mockClear();

      rerender({ type: "Line", data: nextData });

      const usesUpdate = expectedCall === "update";

      expect(mockUpdate.mock.calls).toEqual(
        usesUpdate ? [[nextData[nextData.length - 1]]] : []
      );
      expect(mockSetData.mock.calls).toEqual(usesUpdate ? [] : [[nextData]]);
    });
  });

  it("uses setData() when the new last point is not a plain object", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    // A spread would drop `value`, which this point plots from a prototype getter.
    class PointWithGetter {
      constructor(
        public time: string,
        private readonly rawValue: number
      ) {}

      get value() {
        return this.rawValue;
      }
    }

    const existingData = [new PointWithGetter("2023-01-01", 100)];
    const nextData = [...existingData, new PointWithGetter("2023-01-02", 200)];

    const { rerender } = renderHook(
      (props: SeriesTemplateProps<"Line">) => useSeries(props),
      { initialProps: { type: "Line", data: existingData } }
    );

    mockSetData.mockClear();

    rerender({ type: "Line", data: nextData });

    expect(mockSetData).toHaveBeenCalledWith(nextData);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("uses setData() when the new last point has a non-enumerable field", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    // A spread would drop `value`, which is an own but non-enumerable field.
    const existingData = [{ time: "2023-01-01", value: 100 }];
    const appendedDataPoint = Object.defineProperty({ time: "2023-01-02" }, "value", {
      value: 200,
      enumerable: false,
    });
    const nextData = [...existingData, appendedDataPoint];

    const { rerender } = renderHook(
      (props: SeriesTemplateProps<"Line">) => useSeries(props),
      { initialProps: { type: "Line", data: existingData } }
    );

    mockSetData.mockClear();

    rerender({ type: "Line", data: nextData as never });

    expect(mockSetData).toHaveBeenCalledWith(nextData);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("passes a copy of the last point to update()", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const existingData = [{ time: "2023-01-01", value: 100 }];
    const appendedDataPoint = { time: "2023-01-02", value: 200 };

    const { rerender } = renderHook(
      (props: SeriesTemplateProps<"Line">) => useSeries(props),
      { initialProps: { type: "Line", data: existingData } }
    );

    rerender({ type: "Line", data: [...existingData, appendedDataPoint] });

    expect(mockUpdate).toHaveBeenCalledWith(appendedDataPoint);
    expect(mockUpdate.mock.calls[0][0]).not.toBe(appendedDataPoint);
  });

  it("skips reactive updates while the chart api is gone", () => {
    const chartContext = {
      chartApiRef: { api: vi.fn(mockChart.api) },
      isReady: true,
    };
    vi.mocked(useSafeContext).mockImplementation(() => chartContext);

    const existingData = [{ time: "2023-01-01", value: 100 }];

    const { rerender } = renderHook(
      (props: SeriesTemplateProps<"Line">) => useSeries(props),
      { initialProps: { type: "Line", data: existingData } }
    );

    chartContext.chartApiRef.api.mockReturnValue(null as never);
    mockSetData.mockClear();

    expect(() =>
      rerender({
        type: "Line",
        data: [...existingData, { time: "2023-01-02", value: 200 }],
      })
    ).not.toThrow();
    expect(mockSetData).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("does not read native series data on reactive updates", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const existingData = [
      { time: "2023-01-01", value: 100 },
      { time: "2023-01-02", value: 200 },
    ];
    const appendedData = [...existingData, { time: "2023-01-03", value: 300 }];
    const replacedData = [
      { time: "2023-01-01", value: 150 },
      { time: "2023-01-02", value: 250 },
      { time: "2023-01-03", value: 350 },
    ];

    const { rerender } = renderHook(
      (props: SeriesTemplateProps<"Line">) => useSeries(props),
      { initialProps: { type: "Line", data: existingData } }
    );

    rerender({ type: "Line", data: appendedData });
    rerender({ type: "Line", data: replacedData });

    expect(mockGetData).not.toHaveBeenCalled();
  });

  it("sets data once when the series is created", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const data = [{ time: "2023-01-01", value: 100 }];

    renderHook(() => useSeries({ type: "Line", data }));

    expect(mockSetData).toHaveBeenCalledTimes(1);
    expect(mockSetData).toHaveBeenCalledWith(data);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("creates the series with the latest data when the chart becomes ready", () => {
    const chartContext = {
      chartApiRef: mockChart,
      isReady: false,
    };

    vi.mocked(useSafeContext).mockImplementation(() => chartContext);

    const initialData = [{ time: "2023-01-01", value: 100 }];
    const latestData = [...initialData, { time: "2023-01-02", value: 200 }];

    const { rerender } = renderHook(
      (props: SeriesTemplateProps<"Line">) => useSeries(props),
      { initialProps: { type: "Line", data: initialData } }
    );

    rerender({ type: "Line", data: latestData });
    chartContext.isReady = true;
    rerender({ type: "Line", data: latestData });

    expect(mockSetData).toHaveBeenCalledTimes(1);
    expect(mockSetData).toHaveBeenCalledWith(latestData);
  });

  it("uses update() for consecutive appends", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const firstData = [{ time: "2023-01-01", value: 100 }];
    const secondData = [...firstData, { time: "2023-01-02", value: 200 }];
    const thirdData = [...secondData, { time: "2023-01-03", value: 300 }];

    const { rerender } = renderHook(
      (props: SeriesTemplateProps<"Line">) => useSeries(props),
      { initialProps: { type: "Line", data: firstData } }
    );

    mockSetData.mockClear();

    rerender({ type: "Line", data: secondData });
    rerender({ type: "Line", data: thirdData });

    expect(mockUpdate).toHaveBeenNthCalledWith(1, secondData[1]);
    expect(mockUpdate).toHaveBeenNthCalledWith(2, thirdData[2]);
    expect(mockSetData).not.toHaveBeenCalled();
  });

  it("uses setData() when a middle item changes", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const firstDataPoint = { time: "2023-01-01", value: 100 };
    const lastDataPoint = { time: "2023-01-03", value: 300 };
    const existingData = [
      firstDataPoint,
      { time: "2023-01-02", value: 200 },
      lastDataPoint,
    ];
    const nextData = [firstDataPoint, { time: "2023-01-02", value: 250 }, lastDataPoint];

    const { rerender } = renderHook(
      (props: SeriesTemplateProps<"Line">) => useSeries(props),
      { initialProps: { type: "Line", data: existingData } }
    );

    mockSetData.mockClear();

    rerender({ type: "Line", data: nextData });

    expect(mockSetData).toHaveBeenCalledWith(nextData);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("uses setData() for an append when alwaysReplaceData is set", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const existingData = [{ time: "2023-01-01", value: 100 }];
    const nextData = [...existingData, { time: "2023-01-02", value: 200 }];

    const { rerender } = renderHook(
      (props: SeriesTemplateProps<"Line">) => useSeries(props),
      { initialProps: { type: "Line", data: existingData, alwaysReplaceData: true } }
    );

    mockSetData.mockClear();

    rerender({ type: "Line", data: nextData, alwaysReplaceData: true });

    expect(mockSetData).toHaveBeenCalledWith(nextData);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("does not resync unchanged data when alwaysReplaceData changes", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const data = [{ time: "2023-01-01", value: 100 }];

    const { rerender } = renderHook(
      (props: SeriesTemplateProps<"Line">) => useSeries(props),
      { initialProps: { type: "Line", data } }
    );

    mockSetData.mockClear();

    rerender({ type: "Line", data, alwaysReplaceData: true });

    expect(mockSetData).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it.each([
    ["reactive", true],
    ["non-reactive", false],
  ] as const)(
    "replaces data after reactive is turned back on in a %s mount",
    (_label, initialReactive) => {
      vi.mocked(useSafeContext).mockReturnValue({
        chartApiRef: mockChart,
        isReady: true,
      });

      const existingData = [{ time: "2023-01-01", value: 100 }];
      const nextData = [...existingData, { time: "2023-01-02", value: 200 }];

      const { rerender } = renderHook(
        (props: SeriesTemplateProps<"Line">) => useSeries(props),
        { initialProps: { type: "Line", data: existingData, reactive: initialReactive } }
      );

      rerender({ type: "Line", data: existingData, reactive: false });
      mockSetData.mockClear();
      mockUpdate.mockClear();

      rerender({ type: "Line", data: nextData, reactive: true });

      expect(mockSetData).toHaveBeenCalledWith(nextData);
      expect(mockUpdate).not.toHaveBeenCalled();
    }
  );

  it("diffs against the data a recreated series was initialized with", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const existingData = [{ time: "2023-01-01", value: 100 }];
    const nextData = [...existingData, { time: "2023-01-02", value: 200 }];

    const { result, rerender } = renderHook(
      (props: SeriesTemplateProps<"Line">) => useSeries(props),
      { initialProps: { type: "Line", data: existingData } }
    );

    act(() => {
      result.current.seriesApiRef.current.clear();
    });
    act(() => {
      result.current.seriesApiRef.current.init();
    });
    mockSetData.mockClear();

    rerender({ type: "Line", data: nextData });

    expect(mockUpdate).toHaveBeenCalledWith(nextData[1]);
    expect(mockSetData).not.toHaveBeenCalled();
  });

  it("does not touch the chart when no series was created", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: false,
    });

    const { unmount } = renderHook(() => useSeries({ type: "Line", data: [] }));

    unmount();

    expect(mockRemoveSeries).not.toHaveBeenCalled();
  });

  it("skips native removal while the chart is disposing", () => {
    const disposingChart = { ...mockChart, _isDisposing: false };
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: disposingChart,
      isReady: true,
    });

    const { result, unmount } = renderHook(() => useSeries({ type: "Line", data: [] }));
    const { seriesApiRef } = result.current;

    disposingChart._isDisposing = true;
    unmount();

    expect(mockRemoveSeries).not.toHaveBeenCalled();
    expect(seriesApiRef.current.api()).toBeNull();
  });

  it("drops the series reference when the chart api is already gone", () => {
    const api = vi.fn(mockChart.api);
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: { api },
      isReady: true,
    });

    const { result } = renderHook(() => useSeries({ type: "Line", data: [] }));

    api.mockReturnValue(null as never);
    act(() => result.current.seriesApiRef.current.clear());

    expect(mockRemoveSeries).not.toHaveBeenCalled();
    expect(result.current.seriesApiRef.current.api()).toBeNull();
  });

  it("drops the series reference when there is no chart in context", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: null,
      isReady: false,
    });

    const { result } = renderHook(() => useSeries({ type: "Line", data: [] }));
    const { current: seriesApi } = result.current.seriesApiRef;

    seriesApi._series = {} as never;
    act(() => seriesApi.clear());

    expect(seriesApi.api()).toBeNull();
  });

  it("does not apply series order before the series exists", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: { api: () => null },
      isReady: true,
    });

    expect(() =>
      renderHook(() => useSeries({ type: "Line", data: [], seriesOrder: 1 }))
    ).not.toThrow();
    expect(mockSetSeriesOrder).not.toHaveBeenCalled();
  });
});
