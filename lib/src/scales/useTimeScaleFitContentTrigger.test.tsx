import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSafeContext } from "@/_shared/useSafeContext";
import { useTimeScaleFitContentTrigger } from "./useTimeScaleFitContentTrigger";

vi.mock("@/_shared/useSafeContext");

const mockFitContent = vi.fn();

const mockTimeScale = {
  api: () => ({
    fitContent: mockFitContent,
  }),
};

describe("useTimeScaleFitContentTrigger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls fitContent once on render", async () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      timeScaleApiRef: mockTimeScale,
    });

    renderHook(() =>
      useTimeScaleFitContentTrigger({
        deps: [],
      })
    );

    await Promise.resolve();
    expect(mockFitContent).toHaveBeenCalled();
  });

  it("calls fitContent when deps change", async () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      timeScaleApiRef: mockTimeScale,
    });

    const { rerender } = renderHook(
      props =>
        useTimeScaleFitContentTrigger({
          deps: props.deps,
        }),
      {
        initialProps: {
          deps: [1],
        },
      }
    );

    await Promise.resolve();
    expect(mockFitContent).toHaveBeenCalledTimes(1);

    rerender({ deps: [2] });
    await Promise.resolve();
    expect(mockFitContent).toHaveBeenCalledTimes(2);
  });

  it("does not call fitContent if isReady is false", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: false,
      timeScaleApiRef: mockTimeScale,
    });

    renderHook(() =>
      useTimeScaleFitContentTrigger({
        deps: [],
      })
    );

    expect(mockFitContent).not.toHaveBeenCalled();
  });

  it("does not call fitContent if timeScaleApiRef is undefined", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      timeScaleApiRef: undefined,
    });

    renderHook(() =>
      useTimeScaleFitContentTrigger({
        deps: [],
      })
    );

    expect(mockFitContent).not.toHaveBeenCalled();
  });
});
