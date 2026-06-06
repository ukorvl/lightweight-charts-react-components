import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSafeContext } from "@/_shared/useSafeContext";
import { usePaneContext } from "@/pane/usePaneContext";
import { useTimeScale } from "./useTimeScale";
import type { TimeScaleProps } from "./types";

vi.mock("@/_shared/useSafeContext");
vi.mock("@/pane/usePaneContext");

const mockApplyOptions = vi.fn();
const mockSetVisibleRange = vi.fn();
const mockSetVisibleLogicalRange = vi.fn();
const mockSubscribeVisibleTimeRangeChange = vi.fn();
const mockSubscribeVisibleLogicalRangeChange = vi.fn();
const mockSubscribeSizeChange = vi.fn();
const mockUnsubscribeVisibleTimeRangeChange = vi.fn();
const mockUnsubscribeVisibleLogicalRangeChange = vi.fn();
const mockUnsubscribeSizeChange = vi.fn();
const mockTimeScale = {
  applyOptions: mockApplyOptions,
  setVisibleRange: mockSetVisibleRange,
  setVisibleLogicalRange: mockSetVisibleLogicalRange,
  subscribeVisibleTimeRangeChange: mockSubscribeVisibleTimeRangeChange,
  unsubscribeVisibleTimeRangeChange: mockUnsubscribeVisibleTimeRangeChange,
  subscribeVisibleLogicalRangeChange: mockSubscribeVisibleLogicalRangeChange,
  unsubscribeVisibleLogicalRangeChange: mockUnsubscribeVisibleLogicalRangeChange,
  subscribeSizeChange: mockSubscribeSizeChange,
  unsubscribeSizeChange: mockUnsubscribeSizeChange,
};
const mockTimeScaleFactory = vi.fn().mockReturnValue(mockTimeScale);

const mockChart = {
  api: () => ({
    timeScale: mockTimeScaleFactory,
  }),
};

describe("useTimeScale", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePaneContext).mockReturnValue({
      isInsidePane: false,
      isPaneReady: false,
      paneApiRef: undefined,
    });
  });

  it("initializes timeScale", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    const { result } = renderHook(() => useTimeScale({}));

    const api = result.current.timeScaleApiRef.current.api();
    expect(api).toBeDefined();
  });

  it("initializes ranges and subscriptions from initial props", () => {
    const onVisibleTimeRangeChange = vi.fn();
    const onVisibleLogicalRangeChange = vi.fn();
    const onSizeChange = vi.fn();
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    renderHook(() =>
      useTimeScale({
        options: { rightOffset: 1 },
        visibleRange: {
          from: "2025-05-19",
          to: "2025-05-20",
        },
        visibleLogicalRange: {
          from: 1,
          to: 2,
        },
        onVisibleTimeRangeChange,
        onVisibleLogicalRangeChange,
        onSizeChange,
      })
    );

    expect(mockApplyOptions).toHaveBeenCalledWith({ rightOffset: 1 });
    expect(mockSetVisibleRange).toHaveBeenCalledWith({
      from: "2025-05-19",
      to: "2025-05-20",
    });
    expect(mockSetVisibleLogicalRange).toHaveBeenCalledWith({ from: 1, to: 2 });
    expect(mockSubscribeVisibleTimeRangeChange).toHaveBeenCalledWith(
      onVisibleTimeRangeChange
    );
    expect(mockSubscribeVisibleTimeRangeChange).toHaveBeenCalledTimes(1);
    expect(mockSubscribeVisibleLogicalRangeChange).toHaveBeenCalledWith(
      onVisibleLogicalRangeChange
    );
    expect(mockSubscribeVisibleLogicalRangeChange).toHaveBeenCalledTimes(1);
    expect(mockSubscribeSizeChange).toHaveBeenCalledWith(onSizeChange);
    expect(mockSubscribeSizeChange).toHaveBeenCalledTimes(1);
  });

  it("applies options to timeScale", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    const { rerender } = renderHook(
      props =>
        useTimeScale({
          options: props.options,
        }),
      {
        initialProps: {
          options: {
            rightOffset: 1,
          },
        } as TimeScaleProps,
      }
    );

    expect(mockApplyOptions).toHaveBeenCalledWith({
      rightOffset: 1,
    });

    rerender({
      options: {
        rightOffset: 2,
      },
    });

    expect(mockApplyOptions).toHaveBeenCalledWith({
      rightOffset: 2,
    });
  });

  it("sets visible range", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    const { rerender } = renderHook(
      props =>
        useTimeScale({
          visibleRange: props.visibleRange,
        }),
      {
        initialProps: {} as TimeScaleProps,
      }
    );

    rerender({
      visibleRange: {
        from: "2025-05-19",
        to: "2025-05-20",
      },
    });

    expect(mockSetVisibleRange).toHaveBeenCalledWith({
      from: "2025-05-19",
      to: "2025-05-20",
    });
  });

  it("sets visible logical range", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    const { rerender } = renderHook(
      props =>
        useTimeScale({
          visibleLogicalRange: props.visibleLogicalRange,
        }),
      {
        initialProps: {} as TimeScaleProps,
      }
    );

    rerender({
      visibleLogicalRange: {
        from: 1,
        to: 2,
      },
    });

    expect(mockSetVisibleLogicalRange).toHaveBeenCalledWith({
      from: 1,
      to: 2,
    });
  });

  it("subscribes to visible time range change", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    const { rerender } = renderHook(
      props =>
        useTimeScale({
          onVisibleTimeRangeChange: props.onVisibleTimeRangeChange,
        }),
      {
        initialProps: {} as TimeScaleProps,
      }
    );

    const callback = vi.fn();
    rerender({
      onVisibleTimeRangeChange: callback,
    });

    expect(mockSubscribeVisibleTimeRangeChange).toHaveBeenCalledWith(callback);
  });

  it("subscribes to visible logical range change", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    const { rerender } = renderHook(
      props =>
        useTimeScale({
          onVisibleLogicalRangeChange: props.onVisibleLogicalRangeChange,
        }),
      {
        initialProps: {} as TimeScaleProps,
      }
    );

    const callback = vi.fn();
    rerender({
      onVisibleLogicalRangeChange: callback,
    });

    expect(mockSubscribeVisibleLogicalRangeChange).toHaveBeenCalledWith(callback);
  });

  it("subscribes to size change", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    const { rerender } = renderHook(
      props =>
        useTimeScale({
          onSizeChange: props.onSizeChange,
        }),
      {
        initialProps: {} as TimeScaleProps,
      }
    );

    const callback = vi.fn();
    rerender({
      onSizeChange: callback,
    });

    expect(mockSubscribeSizeChange).toHaveBeenCalledWith(callback);
  });

  it("unsubscribes from callbacks when handlers are removed", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    const onVisibleTimeRangeChange = vi.fn();
    const onVisibleLogicalRangeChange = vi.fn();
    const onSizeChange = vi.fn();

    const { rerender } = renderHook(
      props =>
        useTimeScale({
          onVisibleTimeRangeChange: props.onVisibleTimeRangeChange,
          onVisibleLogicalRangeChange: props.onVisibleLogicalRangeChange,
          onSizeChange: props.onSizeChange,
        }),
      {
        initialProps: {
          onVisibleTimeRangeChange,
          onVisibleLogicalRangeChange,
          onSizeChange,
        } as TimeScaleProps,
      }
    );

    rerender({
      onVisibleTimeRangeChange: undefined,
      onVisibleLogicalRangeChange: undefined,
      onSizeChange: undefined,
    });

    expect(mockSubscribeVisibleTimeRangeChange).toHaveBeenCalledTimes(1);
    expect(mockUnsubscribeVisibleTimeRangeChange).toHaveBeenCalledWith(
      onVisibleTimeRangeChange
    );
    expect(mockUnsubscribeVisibleTimeRangeChange).toHaveBeenCalledTimes(1);
    expect(mockSubscribeVisibleLogicalRangeChange).toHaveBeenCalledTimes(1);
    expect(mockUnsubscribeVisibleLogicalRangeChange).toHaveBeenCalledWith(
      onVisibleLogicalRangeChange
    );
    expect(mockUnsubscribeVisibleLogicalRangeChange).toHaveBeenCalledTimes(1);
    expect(mockSubscribeSizeChange).toHaveBeenCalledTimes(1);
    expect(mockUnsubscribeSizeChange).toHaveBeenCalledWith(onSizeChange);
    expect(mockUnsubscribeSizeChange).toHaveBeenCalledTimes(1);
  });

  it("unsubscribes from initial callbacks exactly once on unmount", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    const onVisibleTimeRangeChange = vi.fn();
    const onVisibleLogicalRangeChange = vi.fn();
    const onSizeChange = vi.fn();

    const { unmount } = renderHook(() =>
      useTimeScale({
        onVisibleTimeRangeChange,
        onVisibleLogicalRangeChange,
        onSizeChange,
      })
    );

    unmount();

    expect(mockSubscribeVisibleTimeRangeChange).toHaveBeenCalledTimes(1);
    expect(mockUnsubscribeVisibleTimeRangeChange).toHaveBeenCalledWith(
      onVisibleTimeRangeChange
    );
    expect(mockUnsubscribeVisibleTimeRangeChange).toHaveBeenCalledTimes(1);
    expect(mockSubscribeVisibleLogicalRangeChange).toHaveBeenCalledTimes(1);
    expect(mockUnsubscribeVisibleLogicalRangeChange).toHaveBeenCalledWith(
      onVisibleLogicalRangeChange
    );
    expect(mockUnsubscribeVisibleLogicalRangeChange).toHaveBeenCalledTimes(1);
    expect(mockSubscribeSizeChange).toHaveBeenCalledTimes(1);
    expect(mockUnsubscribeSizeChange).toHaveBeenCalledWith(onSizeChange);
    expect(mockUnsubscribeSizeChange).toHaveBeenCalledTimes(1);
  });

  it("does not initialize timeScale if chart is not ready", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: false,
      chartApiRef: mockChart,
    });

    const { result } = renderHook(() => useTimeScale({}));

    expect(result.current.timeScaleApiRef.current.api()).toBeNull();
  });

  it("does not initialize timeScale if chart api is not defined", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: null,
    });

    const { result } = renderHook(() => useTimeScale({}));

    expect(result.current.timeScaleApiRef.current.api()).toBeNull();
  });

  it("does not initialize timeScale when pane is not ready", () => {
    vi.mocked(usePaneContext).mockReturnValue({
      isInsidePane: true,
      isPaneReady: false,
      paneApiRef: undefined,
    });
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    const { result } = renderHook(() => useTimeScale({}));

    expect(result.current.timeScaleApiRef.current.api()).toBeNull();
    expect(mockTimeScaleFactory).not.toHaveBeenCalled();
  });

  it("clears the time scale on unmount", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    const { result, unmount } = renderHook(() => useTimeScale({}));

    expect(result.current.timeScaleApiRef.current.api()).toBeDefined();

    unmount();

    expect(result.current.timeScaleApiRef.current.api()).toBeNull();
  });

  it("returns the existing time scale instance from init", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    const { result } = renderHook(() => useTimeScale({}));

    const api = result.current.timeScaleApiRef.current.init();

    expect(api).toBe(mockTimeScale);
    expect(mockTimeScaleFactory).toHaveBeenCalledTimes(1);
  });
});
