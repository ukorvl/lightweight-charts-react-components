import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSafeContext } from "@/_shared/useSafeContext";
import { useTimeScale } from "./useTimeScale";
import type { TimeScaleProps } from "./types";

vi.mock("@/_shared/useSafeContext");

const mockApplyOptions = vi.fn();
const mockSetVisibleRange = vi.fn();
const mockSetVisibleLogicalRange = vi.fn();
const mockSubscribeVisibleTimeRangeChange = vi.fn();
const mockSubscribeVisibleLogicalRangeChange = vi.fn();
const mockSubscribeSizeChange = vi.fn();

const mockChart = {
  api: () => ({
    timeScale: vi.fn().mockReturnValue({
      applyOptions: mockApplyOptions,
      setVisibleRange: mockSetVisibleRange,
      setVisibleLogicalRange: mockSetVisibleLogicalRange,
      subscribeVisibleTimeRangeChange: mockSubscribeVisibleTimeRangeChange,
      subscribeVisibleLogicalRangeChange: mockSubscribeVisibleLogicalRangeChange,
      subscribeSizeChange: mockSubscribeSizeChange,
    }),
  }),
};

describe("useTimeScale", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
