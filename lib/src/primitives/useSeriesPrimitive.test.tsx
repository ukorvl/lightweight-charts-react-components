import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSafeContext } from "@/_shared/useSafeContext";
import { useSeriesPrimitive } from "./useSeriesPrimitive";

vi.mock("@/_shared/useSafeContext");

const createMockSeriesApi = () => ({
  attachPrimitive: vi.fn(),
  detachPrimitive: vi.fn(),
});

const mockChartApi = {};
const mockChart = {
  api: () => mockChartApi,
};

const mockSeriesApi = createMockSeriesApi();
const { attachPrimitive: mockAttachPrimitive, detachPrimitive: mockDetachPrimitive } =
  mockSeriesApi;

const mockSeries = {
  api: () => mockSeriesApi,
};

describe("useSeriesPrimitive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes seriesPrimitive", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
      seriesApiRef: mockSeries,
    });

    const { result } = renderHook(() =>
      useSeriesPrimitive({
        plugin: {},
      })
    );

    const api = result.current.current.api();
    expect(api).toBeDefined();
  });

  it("does not initialize seriesPrimitive if not ready", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: false,
      chartApiRef: mockChart,
      seriesApiRef: mockSeries,
    });

    const { result } = renderHook(() =>
      useSeriesPrimitive({
        plugin: {},
      })
    );

    expect(result.current.current.api()).toBeNull();
  });

  it("calls render function if provided", () => {
    const renderMock = vi.fn().mockReturnValue({});

    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
      seriesApiRef: mockSeries,
    });

    renderHook(() =>
      useSeriesPrimitive({
        render: renderMock,
      })
    );

    expect(renderMock).toHaveBeenCalled();
    expect(mockAttachPrimitive).toHaveBeenCalled();
  });

  it("clears primitive on unmount", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
      seriesApiRef: mockSeries,
    });

    const { unmount } = renderHook(() =>
      useSeriesPrimitive({
        plugin: {},
      })
    );

    unmount();
    expect(mockDetachPrimitive).toHaveBeenCalled();
  });

  it("reinitializes seriesPrimitive when the plugin object changes", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
      seriesApiRef: mockSeries,
    });

    const initialPlugin = { id: "initial" };
    const nextPlugin = { id: "next" };

    const { rerender, result } = renderHook(
      ({ pluginToUse }: { pluginToUse: object }) =>
        useSeriesPrimitive({
          plugin: pluginToUse,
        }),
      {
        initialProps: { pluginToUse: initialPlugin },
      }
    );

    rerender({ pluginToUse: nextPlugin });

    expect(mockDetachPrimitive).toHaveBeenCalledWith(initialPlugin);
    expect(mockAttachPrimitive).toHaveBeenLastCalledWith(nextPlugin);
    expect(result.current.current.api()).toBe(nextPlugin);
  });

  it("reinitializes seriesPrimitive when the render callback changes", () => {
    const initialPrimitive = { id: "initial-rendered" };
    const nextPrimitive = { id: "next-rendered" };
    const initialRender = vi.fn().mockReturnValue(initialPrimitive);
    const nextRender = vi.fn().mockReturnValue(nextPrimitive);

    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
      seriesApiRef: mockSeries,
    });

    const { rerender, result } = renderHook(
      ({ renderPrimitive }: { renderPrimitive: typeof initialRender }) =>
        useSeriesPrimitive({
          render: renderPrimitive,
        }),
      {
        initialProps: { renderPrimitive: initialRender },
      }
    );

    rerender({ renderPrimitive: nextRender });

    expect(mockDetachPrimitive).toHaveBeenCalledWith(initialPrimitive);
    expect(nextRender).toHaveBeenCalledWith({
      chart: mockChartApi,
      series: mockSeriesApi,
    });
    expect(mockAttachPrimitive).toHaveBeenLastCalledWith(nextPrimitive);
    expect(result.current.current.api()).toBe(nextPrimitive);
  });

  it("detaches seriesPrimitive from the original series when series context changes before reinitialization", () => {
    const initialPlugin = { id: "initial" };
    const nextPlugin = { id: "next" };
    const initialSeriesApi = createMockSeriesApi();
    const nextSeriesApi = createMockSeriesApi();
    let currentSeriesApi = initialSeriesApi;

    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
      seriesApiRef: {
        api: () => currentSeriesApi,
      },
    });

    const { rerender } = renderHook(
      ({ pluginToUse }: { pluginToUse: object }) =>
        useSeriesPrimitive({
          plugin: pluginToUse,
        }),
      {
        initialProps: { pluginToUse: initialPlugin },
      }
    );

    currentSeriesApi = nextSeriesApi;
    rerender({ pluginToUse: initialPlugin });
    rerender({ pluginToUse: nextPlugin });

    expect(initialSeriesApi.detachPrimitive).toHaveBeenCalledWith(initialPlugin);
    expect(nextSeriesApi.detachPrimitive).not.toHaveBeenCalled();
    expect(nextSeriesApi.attachPrimitive).toHaveBeenCalledWith(nextPlugin);
  });

  it("detaches seriesPrimitive from the original series on unmount after series context changes", () => {
    const initialPlugin = { id: "initial" };
    const initialSeriesApi = createMockSeriesApi();
    const nextSeriesApi = createMockSeriesApi();
    let currentSeriesApi = initialSeriesApi;

    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
      seriesApiRef: {
        api: () => currentSeriesApi,
      },
    });

    const { rerender, unmount } = renderHook(
      ({ pluginToUse }: { pluginToUse: object }) =>
        useSeriesPrimitive({
          plugin: pluginToUse,
        }),
      {
        initialProps: { pluginToUse: initialPlugin },
      }
    );

    currentSeriesApi = nextSeriesApi;
    rerender({ pluginToUse: initialPlugin });
    unmount();

    expect(initialSeriesApi.detachPrimitive).toHaveBeenCalledWith(initialPlugin);
    expect(nextSeriesApi.detachPrimitive).not.toHaveBeenCalled();
  });
});
