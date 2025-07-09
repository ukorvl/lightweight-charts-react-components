import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSafeContext } from "@/_shared/useSafeContext";
import { usePane } from "./usePane";
import type { PaneProps } from "./types";

vi.mock("@/_shared/useSafeContext");

const mockAddPane = vi.fn().mockReturnValue({
  paneIndex: vi.fn().mockReturnValue(0),
  setHeight: vi.fn(),
  setStretchFactor: vi.fn(),
});

const mockRemovePane = vi.fn();

const mockChart = {
  api: () => ({
    addPane: mockAddPane,
    removePane: mockRemovePane,
  }),
};

describe("usePane", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a pane", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const { result } = renderHook(() => usePane());

    const api = result.current.paneApiRef.current.api();
    expect(api).toBeDefined();
    expect(mockAddPane).toHaveBeenCalled();
    expect(mockRemovePane).not.toHaveBeenCalled();
  });

  it("should clear the pane on unmount", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: true,
    });

    const { unmount } = renderHook(() => usePane());

    unmount();

    expect(mockRemovePane).toHaveBeenCalled();
  });

  it("should apply stretch factor to the pane", () => {
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
        } as PaneProps,
      }
    );

    const newOptions = {
      stretchFactor: 3,
    };

    rerender(newOptions);

    expect(mockAddPane().setStretchFactor).toHaveBeenCalledWith(newOptions.stretchFactor);
  });

  it("should not create a pane if not ready", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      chartApiRef: mockChart,
      isReady: false,
    });

    const { result } = renderHook(() => usePane());

    const api = result.current.paneApiRef.current.api();
    expect(api).toBeNull();
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
    expect(mockAddPane).not.toHaveBeenCalled();
  });
});
