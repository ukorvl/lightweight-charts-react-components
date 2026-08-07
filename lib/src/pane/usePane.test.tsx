import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSafeContext } from "@/_shared/useSafeContext";
import { usePane } from "./usePane";
import type { PaneProps } from "./types";

vi.mock("@/_shared/useSafeContext");

const mockPaneApi = {
  paneIndex: vi.fn().mockReturnValue(0),
  setHeight: vi.fn(),
  setStretchFactor: vi.fn(),
};

const mockAddPane = vi.fn(() => mockPaneApi);

const mockRemovePane = vi.fn();
const mockChartApi = {
  addPane: mockAddPane,
  removePane: mockRemovePane,
};

const mockChart = {
  api: vi.fn(() => mockChartApi),
};

describe("usePane", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPaneApi.paneIndex.mockReturnValue(0);
    mockChart.api.mockReturnValue(mockChartApi);
  });

  it("should create a pane", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const { result } = renderHook(() => usePane());

    const api = result.current.paneApiRef.current.api();
    expect(api).toBe(mockPaneApi);
    expect(result.current.isReady).toBe(true);
    expect(mockAddPane).toHaveBeenCalledWith(true);
    expect(mockRemovePane).not.toHaveBeenCalled();
  });

  it("should clear the pane on unmount", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const { unmount } = renderHook(() => usePane());

    unmount();

    expect(mockRemovePane).toHaveBeenCalledWith(0);
  });

  it("should clear the pane through the exposed api", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const { result } = renderHook(() => usePane());

    expect(result.current.isReady).toBe(true);

    act(() => {
      result.current.paneApiRef.current.clear();
    });

    expect(result.current.paneApiRef.current.api()).toBeNull();
    expect(result.current.isReady).toBe(false);
    expect(mockRemovePane).toHaveBeenCalledWith(0);
  });

  it("should apply stretch factor during init and on updates", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const { rerender } = renderHook(
      props =>
        usePane({
          stretchFactor: props.stretchFactor,
        }),
      {
        initialProps: {
          stretchFactor: 2,
        } as Omit<PaneProps, "children">,
      }
    );

    expect(mockPaneApi.setStretchFactor.mock.calls).toEqual([[2], [2]]);

    const newOptions = {
      stretchFactor: 3,
    };

    rerender(newOptions);

    expect(mockPaneApi.setStretchFactor.mock.calls).toEqual([[2], [2], [3]]);
  });

  it("should not create a pane if not ready", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: false,
    });

    const { result } = renderHook(() => usePane());

    const api = result.current.paneApiRef.current.api();
    expect(api).toBeNull();
    expect(result.current.isReady).toBe(false);
    expect(mockAddPane).not.toHaveBeenCalled();
  });

  it("should not create pane if no chartApiRef", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: null,
      isReady: true,
    });

    const { result } = renderHook(() => usePane());

    const api = result.current.paneApiRef.current.api();
    expect(api).toBeNull();
    expect(result.current.isReady).toBe(false);
    expect(mockAddPane).not.toHaveBeenCalled();
  });

  it("should initialize once the chart becomes ready", () => {
    const chartContext = {
      chartApiRef: mockChart,
      isReady: false,
    };

    vi.mocked(useSafeContext).mockImplementation(() => chartContext);

    const { result, rerender } = renderHook(() => usePane());

    expect(result.current.paneApiRef.current.api()).toBeNull();
    expect(result.current.isReady).toBe(false);
    expect(mockAddPane).not.toHaveBeenCalled();

    chartContext.isReady = true;
    rerender();

    expect(result.current.paneApiRef.current.api()).toBe(mockPaneApi);
    expect(result.current.isReady).toBe(true);
    expect(mockAddPane).toHaveBeenCalledTimes(1);
  });

  it("should not apply stretch factor updates before a pane exists", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: false,
    });

    const { rerender } = renderHook(
      props =>
        usePane({
          stretchFactor: props.stretchFactor,
        }),
      {
        initialProps: {
          stretchFactor: 2,
        } as Omit<PaneProps, "children">,
      }
    );

    rerender({
      stretchFactor: 3,
    });

    expect(mockAddPane).not.toHaveBeenCalled();
    expect(mockPaneApi.setStretchFactor).not.toHaveBeenCalled();
  });

  it("should not throw when the chart api is unavailable during cleanup", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });
    mockChart.api
      .mockReturnValueOnce(mockChartApi)
      .mockReturnValueOnce(undefined as unknown as typeof mockChartApi);

    const { unmount } = renderHook(() => usePane());

    expect(() => unmount()).not.toThrow();
    expect(mockRemovePane).not.toHaveBeenCalled();
  });
});
