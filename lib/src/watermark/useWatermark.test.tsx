import { renderHook } from "@testing-library/react";
import { createImageWatermark, createTextWatermark } from "lightweight-charts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSafeContext } from "@/_shared/useSafeContext";
import type { PaneApiRef } from "@/pane";
import { usePaneContext } from "@/pane/usePaneContext";
import { useWatermark } from "./useWatermark";
import type { WatermarkProps } from "./types";

vi.mock("@/_shared/useSafeContext");
vi.mock("@/pane/usePaneContext");
vi.mock("lightweight-charts");

const mockDetach = vi.fn();
const mockApplyOptions = vi.fn();
const mockGetPane = vi.fn();

const mockChart = {
  api: () => ({
    panes: () => [{}],
  }),
};

const mockPane = {
  api: () => ({
    paneIndex: () => 0,
  }),
} as unknown as PaneApiRef<unknown>;

describe("useWatermark", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes text watermark", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    vi.mocked(usePaneContext).mockReturnValue({
      isPaneReady: true,
      isInsidePane: true,
      paneApiRef: mockPane,
    });

    vi.mocked(createTextWatermark).mockReturnValue({
      detach: mockDetach,
      applyOptions: mockApplyOptions,
      getPane: mockGetPane,
    });

    const { result } = renderHook(() =>
      useWatermark({
        type: "text",
        lines: [
          {
            text: "Test Watermark",
            fontSize: 20,
          },
        ],
      })
    );

    const api = result.current.current.api();
    expect(api).toBeDefined();
    expect(createTextWatermark).toHaveBeenCalled();
  });

  it("initializes image watermark", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    vi.mocked(usePaneContext).mockReturnValue({
      isPaneReady: true,
      isInsidePane: true,
      paneApiRef: mockPane,
    });

    vi.mocked(createImageWatermark).mockReturnValue({
      detach: mockDetach,
      applyOptions: mockApplyOptions,
      getPane: mockGetPane,
    });

    const { result } = renderHook(() =>
      useWatermark({
        type: "image",
        src: "src",
      })
    );

    const api = result.current.current.api();
    expect(api).toBeDefined();
    expect(createImageWatermark).toHaveBeenCalled();
  });

  it("clears watermark on unmount", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    vi.mocked(usePaneContext).mockReturnValue({
      isPaneReady: true,
      isInsidePane: true,
      paneApiRef: mockPane,
    });

    vi.mocked(createTextWatermark).mockReturnValue({
      detach: mockDetach,
      applyOptions: mockApplyOptions,
      getPane: mockGetPane,
    });

    const { unmount } = renderHook(() =>
      useWatermark({
        type: "text",
        lines: [
          {
            text: "Test Watermark",
            fontSize: 20,
          },
        ],
      })
    );

    unmount();
    expect(mockDetach).toHaveBeenCalled();
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

    expect(() =>
      renderHook(() =>
        useWatermark({
          type: "text",
          lines: [
            {
              text: "Test Watermark",
              fontSize: 20,
            },
          ],
        })
      )
    ).toThrowError(
      "Watermark must be used inside a pane. Please ensure that the component is wrapped in a pane component."
    );
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
      useWatermark({
        type: "text",
        lines: [
          {
            text: "Test Watermark",
            fontSize: 20,
          },
        ],
      })
    );

    expect(result.current.current.api()).toBeNull();
  });

  it("recreates image watermark when src changes", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    vi.mocked(usePaneContext).mockReturnValue({
      isPaneReady: true,
      isInsidePane: true,
      paneApiRef: mockPane,
    });

    const firstWatermark = {
      detach: vi.fn(),
      applyOptions: vi.fn(),
      getPane: mockGetPane,
    };
    const secondWatermark = {
      detach: vi.fn(),
      applyOptions: vi.fn(),
      getPane: mockGetPane,
    };

    vi.mocked(createImageWatermark)
      .mockReturnValueOnce(firstWatermark)
      .mockReturnValueOnce(secondWatermark);

    const { rerender } = renderHook(props => useWatermark(props), {
      initialProps: {
        type: "image",
        src: "first",
      } as WatermarkProps<"image">,
    });

    rerender({
      type: "image",
      src: "second",
    });

    expect(firstWatermark.detach).toHaveBeenCalledTimes(1);
    expect(createImageWatermark).toHaveBeenCalledTimes(2);
    expect(createImageWatermark).toHaveBeenNthCalledWith(
      1,
      expect.any(Object),
      "first",
      {}
    );
    expect(createImageWatermark).toHaveBeenNthCalledWith(
      2,
      expect.any(Object),
      "second",
      {}
    );
  });

  it("applies image options without passing src", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    vi.mocked(usePaneContext).mockReturnValue({
      isPaneReady: true,
      isInsidePane: true,
      paneApiRef: mockPane,
    });

    const imageWatermark = {
      detach: vi.fn(),
      applyOptions: vi.fn(),
      getPane: mockGetPane,
    };

    vi.mocked(createImageWatermark).mockReturnValue(imageWatermark);

    const { rerender } = renderHook(props => useWatermark(props), {
      initialProps: {
        type: "image",
        src: "logo",
        alpha: 0.5,
      } as WatermarkProps<"image">,
    });

    rerender({
      type: "image",
      src: "logo",
      alpha: 0.8,
    });

    expect(createImageWatermark).toHaveBeenCalledTimes(1);
    expect(imageWatermark.applyOptions).toHaveBeenLastCalledWith({ alpha: 0.8 });
  });
});
