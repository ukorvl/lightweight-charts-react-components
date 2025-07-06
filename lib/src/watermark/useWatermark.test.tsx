import { renderHook } from "@testing-library/react";
import { createImageWatermark, createTextWatermark } from "lightweight-charts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSafeContext } from "@/_shared/useSafeContext";
import type { PaneApiRef } from "@/pane";
import { usePaneContext } from "@/pane/usePaneContext";
import { useWatermark } from "./useWatermark";

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
} as unknown as PaneApiRef;

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
});
