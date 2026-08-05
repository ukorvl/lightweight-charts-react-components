import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
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

  it("throws for unsupported yield curve series types", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
      chartKind: "yield-curve",
    });

    expect(() =>
      renderHook(() =>
        useSeries({
          type: "Candlestick",
          data: [],
        })
      )
    ).toThrow("YieldCurveChart only supports LineSeries and AreaSeries.");
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
});
