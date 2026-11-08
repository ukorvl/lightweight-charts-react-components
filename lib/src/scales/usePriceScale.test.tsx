import { renderHook } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BaseInternalError } from "@/_shared/InternalError";
import { useSafeContext } from "@/_shared/useSafeContext";
import type { PaneApiRef } from "@/pane";
import { usePaneContext } from "@/pane/usePaneContext";
import { SeriesContext } from "@/series/SeriesContext";
import type { ISeriesContext } from "@/series/types";
import { usePriceScale } from "./usePriceScale";
import type { ReactNode } from "react";

vi.mock("@/_shared/useSafeContext");
vi.mock("@/pane/usePaneContext");

const mockApplyOptions = vi.fn();
const mockPriceScaleApi = {
  applyOptions: mockApplyOptions,
  options: vi.fn(),
  width: vi.fn(),
};
const mockPriceScaleFactory = vi.fn().mockReturnValue(mockPriceScaleApi);

const mockChart = {
  api: () => ({
    priceScale: mockPriceScaleFactory,
  }),
};

const mockPane = {
  api: () => ({
    paneIndex: () => 0,
  }),
} as unknown as PaneApiRef<unknown>;

const createPane = (paneIndex: number) =>
  ({
    api: () => ({
      paneIndex: () => paneIndex,
    }),
  }) as unknown as PaneApiRef<unknown>;

const createSeriesWrapper = (seriesContext: ISeriesContext<unknown>) => {
  const SeriesWrapper = ({ children }: { children: ReactNode }) => (
    <SeriesContext.Provider value={seriesContext}>{children}</SeriesContext.Provider>
  );

  return SeriesWrapper;
};

const captureHookError = (callback: () => void) => {
  try {
    callback();
  } catch (error) {
    return error as BaseInternalError;
  }

  throw new Error("Expected renderHook to throw");
};

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
  });

  it("returns the existing priceScale instance when init is called again", () => {
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

    const initialCallCount = mockPriceScaleFactory.mock.calls.length;
    const api = result.current.current.init();

    expect(api).toBe(result.current.current.api());
    expect(mockPriceScaleFactory.mock.calls.length).toBe(initialCallCount);
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

  it("updates the priceScale when the id changes", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    vi.mocked(usePaneContext).mockReturnValue({
      isPaneReady: true,
      isInsidePane: true,
      paneApiRef: mockPane,
    });

    const { result, rerender } = renderHook(
      props =>
        usePriceScale({
          id: props.id,
          options: { autoScale: true },
        }),
      {
        initialProps: {
          id: "right",
        },
      }
    );

    const initialApi = result.current.current.api();

    rerender({
      id: "left",
    });

    expect(mockPriceScaleFactory).toHaveBeenNthCalledWith(1, "right", 0);
    expect(mockPriceScaleFactory).toHaveBeenNthCalledWith(2, "right", 0);
    expect(mockPriceScaleFactory).toHaveBeenNthCalledWith(3, "left", 0);
    expect(result.current.current.api()).toBe(mockPriceScaleApi);
    expect(result.current.current.api()).toBe(initialApi);
    expect(mockApplyOptions).toHaveBeenLastCalledWith({
      autoScale: true,
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

  it("throws error if used outside of a pane", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    vi.mocked(usePaneContext).mockReturnValue({
      isPaneReady: false,
      isInsidePane: false,
      paneApiRef: mockPane,
    });

    const error = captureHookError(() =>
      renderHook(() =>
        usePriceScale({
          id: "right",
        })
      )
    );

    expect(error).toBeInstanceOf(BaseInternalError);
    expect(error.isOperational).toBe(true);
    expect(error.message).toContain(
      "PriceScale must be used inside a pane. Please ensure that the component is wrapped in a pane component."
    );
    expect(error.message).not.toContain("Docs:");
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

  it("initializes once the chart becomes ready", () => {
    const chartContext = {
      isReady: false,
      chartApiRef: mockChart,
    };

    vi.mocked(useSafeContext).mockImplementation(() => chartContext);
    vi.mocked(usePaneContext).mockReturnValue({
      isPaneReady: true,
      isInsidePane: true,
      paneApiRef: mockPane,
    });

    const { result, rerender } = renderHook(() =>
      usePriceScale({
        id: "right",
      })
    );

    expect(result.current.current.api()).toBeNull();
    expect(mockPriceScaleFactory).not.toHaveBeenCalled();

    chartContext.isReady = true;
    rerender();

    expect(result.current.current.api()).toBeDefined();
    expect(mockPriceScaleFactory).toHaveBeenCalledTimes(1);
  });

  it("initializes once the pane becomes ready", () => {
    const paneContext = {
      isPaneReady: false,
      isInsidePane: true,
      paneApiRef: mockPane,
    };

    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });
    vi.mocked(usePaneContext).mockImplementation(() => paneContext);

    const { result, rerender } = renderHook(() =>
      usePriceScale({
        id: "right",
      })
    );

    expect(result.current.current.api()).toBeNull();
    expect(mockPriceScaleFactory).not.toHaveBeenCalled();

    paneContext.isPaneReady = true;
    rerender();

    expect(result.current.current.api()).toBeDefined();
    expect(mockPriceScaleFactory).toHaveBeenCalledTimes(1);
  });

  it("resolves the priceScale in the pane it is rendered in", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    vi.mocked(usePaneContext).mockReturnValue({
      isPaneReady: true,
      isInsidePane: true,
      paneApiRef: createPane(2),
    });

    const { rerender } = renderHook(props => usePriceScale({ id: props.id }), {
      initialProps: { id: "right" },
    });

    expect(mockPriceScaleFactory).toHaveBeenCalledWith("right", 2);

    rerender({ id: "overlay" });

    expect(mockPriceScaleFactory).toHaveBeenLastCalledWith("overlay", 2);
    expect(mockPriceScaleFactory).not.toHaveBeenCalledWith(expect.any(String), 0);
  });

  it("waits for the parent series before initializing", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    vi.mocked(usePaneContext).mockReturnValue({
      isPaneReady: true,
      isInsidePane: true,
      paneApiRef: mockPane,
    });

    const seriesContext: ISeriesContext<unknown> = {
      seriesApiRef: {} as ISeriesContext<unknown>["seriesApiRef"],
      isReady: false,
    };

    const { result, rerender } = renderHook(
      () => usePriceScale({ id: "overlay", options: { autoScale: true } }),
      { wrapper: createSeriesWrapper(seriesContext) }
    );

    expect(result.current.current.api()).toBeNull();
    expect(mockPriceScaleFactory).not.toHaveBeenCalled();
    expect(mockApplyOptions).not.toHaveBeenCalled();

    seriesContext.isReady = true;
    rerender();

    expect(result.current.current.api()).toBe(mockPriceScaleApi);
    expect(mockPriceScaleFactory).toHaveBeenCalledWith("overlay", 0);
    expect(mockApplyOptions).toHaveBeenCalledWith({ autoScale: true });
  });

  it("clears the priceScale ref on unmount", () => {
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
