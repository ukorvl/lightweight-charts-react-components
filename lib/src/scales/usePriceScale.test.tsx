import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSafeContext } from "@/_shared/useSafeContext";
import type { PaneApiRef } from "@/pane";
import { usePaneContext } from "@/pane/usePaneContext";
import { usePriceScale } from "./usePriceScale";

vi.mock("@/_shared/useSafeContext");
vi.mock("@/pane/usePaneContext");

const mockApplyOptions = vi.fn();
const mockPriceScaleApi = {
  applyOptions: mockApplyOptions,
  options: vi.fn(),
  width: vi.fn(),
};
const mockChartPriceScale = vi.fn().mockReturnValue(mockPriceScaleApi);

const createChartRef = (
  api: (() => { priceScale: typeof mockChartPriceScale } | null) | null = () => ({
    priceScale: mockChartPriceScale,
  })
) => ({
  api: api ?? undefined,
});

const mockChart = createChartRef();

const mockPane = {
  api: () => ({
    paneIndex: () => 0,
  }),
} as unknown as PaneApiRef<unknown>;

describe("usePriceScale", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes priceScale", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    vi.mocked(usePaneContext).mockReturnValue({
      isPaneReady: true,
      isInsidePane: true,
      paneApiRef: mockPane,
    });

    const { result } = renderHook(() =>
      usePriceScale({
        id: "right",
      })
    );

    const api = result.current.current.api();
    expect(api).toBeDefined();
    expect(mockChartPriceScale).toHaveBeenCalledWith("right", 0);
  });

  it("returns the existing price scale when init is called after initialization", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    vi.mocked(usePaneContext).mockReturnValue({
      isPaneReady: true,
      isInsidePane: true,
      paneApiRef: mockPane,
    });

    const { result } = renderHook(() =>
      usePriceScale({
        id: "right",
      })
    );

    expect(result.current.current.init()).toBe(mockPriceScaleApi);
    expect(mockChartPriceScale).toHaveBeenCalledTimes(1);
  });

  it("applies options to priceScale", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    vi.mocked(usePaneContext).mockReturnValue({
      isPaneReady: true,
      isInsidePane: true,
      paneApiRef: mockPane,
    });

    const { rerender } = renderHook(
      props =>
        usePriceScale({
          id: "right",
          options: props.options,
        }),
      {
        initialProps: {
          options: {
            autoScale: true,
          },
        },
      }
    );

    expect(mockApplyOptions).toHaveBeenCalledWith({
      autoScale: true,
    });

    rerender({
      options: {
        autoScale: false,
      },
    });

    expect(mockApplyOptions).toHaveBeenCalledWith({
      autoScale: false,
    });
  });

  it("does not initialize priceScale if not ready", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: false,
      chartApiRef: mockChart,
    });

    vi.mocked(usePaneContext).mockReturnValue({
      isPaneReady: true,
      isInsidePane: true,
      paneApiRef: mockPane,
    });

    const { result } = renderHook(() =>
      usePriceScale({
        id: "right",
      })
    );

    expect(result.current.current.api()).toBeNull();
  });

  it("does not initialize priceScale if no chartApiRef", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: null,
    });

    vi.mocked(usePaneContext).mockReturnValue({
      isPaneReady: true,
      isInsidePane: true,
      paneApiRef: mockPane,
    });

    const { result } = renderHook(() =>
      usePriceScale({
        id: "right",
      })
    );

    expect(result.current.current.api()).toBeNull();
  });

  it("does not initialize when the chart api is unavailable", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: createChartRef(() => null),
    });

    vi.mocked(usePaneContext).mockReturnValue({
      isPaneReady: true,
      isInsidePane: true,
      paneApiRef: mockPane,
    });

    const { result } = renderHook(() =>
      usePriceScale({
        id: "right",
      })
    );

    expect(result.current.current.init()).toBeNull();
    expect(result.current.current.api()).toBeNull();
  });

  it("defaults to the root pane when used outside of a pane", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    vi.mocked(usePaneContext).mockReturnValue({
      isPaneReady: false,
      isInsidePane: false,
      paneApiRef: mockPane,
    });

    const { result } = renderHook(() =>
      usePriceScale({
        id: "volume",
      })
    );

    expect(result.current.current.api()).toBeDefined();
    expect(mockChartPriceScale).toHaveBeenCalledWith("volume", 0);
  });

  it("does not initialize if pane is not ready", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    vi.mocked(usePaneContext).mockReturnValue({
      isPaneReady: false,
      isInsidePane: true,
      paneApiRef: mockPane,
    });

    const { result } = renderHook(() =>
      usePriceScale({
        id: "right",
      })
    );

    expect(result.current.current.api()).toBeNull();
  });

  it("uses the current pane index when resolving a price scale", () => {
    const nonDefaultPane = {
      api: () => ({
        paneIndex: () => 2,
      }),
    } as unknown as PaneApiRef<unknown>;

    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    vi.mocked(usePaneContext).mockReturnValue({
      isPaneReady: true,
      isInsidePane: true,
      paneApiRef: nonDefaultPane,
    });

    renderHook(() =>
      usePriceScale({
        id: "volume",
      })
    );

    expect(mockChartPriceScale).toHaveBeenCalledWith("volume", 2);
  });

  it("falls back to pane index 0 when the pane api is unavailable", () => {
    const paneWithoutApi = {
      api: () => null,
    } as unknown as PaneApiRef<unknown>;

    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    vi.mocked(usePaneContext).mockReturnValue({
      isPaneReady: true,
      isInsidePane: true,
      paneApiRef: paneWithoutApi,
    });

    renderHook(() =>
      usePriceScale({
        id: "volume",
      })
    );

    expect(mockChartPriceScale).toHaveBeenCalledWith("volume", 0);
  });

  it("keeps the current pane index when the scale id changes", () => {
    const nonDefaultPane = {
      api: () => ({
        paneIndex: () => 3,
      }),
    } as unknown as PaneApiRef<unknown>;

    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    vi.mocked(usePaneContext).mockReturnValue({
      isPaneReady: true,
      isInsidePane: true,
      paneApiRef: nonDefaultPane,
    });

    const { rerender } = renderHook(
      props =>
        usePriceScale({
          id: props.id,
        }),
      {
        initialProps: {
          id: "left",
        },
      }
    );

    rerender({
      id: "volume",
    });

    expect(mockChartPriceScale).toHaveBeenLastCalledWith("volume", 3);
  });

  it("does nothing when setId cannot resolve a price scale", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: createChartRef(() => null),
    });

    vi.mocked(usePaneContext).mockReturnValue({
      isPaneReady: true,
      isInsidePane: true,
      paneApiRef: mockPane,
    });

    const { result } = renderHook(() =>
      usePriceScale({
        id: "right",
      })
    );

    expect(result.current.current.setId("volume")).toBeUndefined();
    expect(result.current.current.api()).toBeNull();
  });

  it("clears the cached price scale on unmount", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    vi.mocked(usePaneContext).mockReturnValue({
      isPaneReady: true,
      isInsidePane: true,
      paneApiRef: mockPane,
    });

    const { result, unmount } = renderHook(() =>
      usePriceScale({
        id: "right",
      })
    );

    expect(result.current.current.api()).toBeDefined();

    unmount();

    expect(result.current.current.api()).toBeNull();
  });
});
