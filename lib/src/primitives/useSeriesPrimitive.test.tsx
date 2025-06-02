import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSafeContext } from "@/_shared/useSafeContext";
import { useSeriesPrimitive } from "./useSeriesPrimitive";

vi.mock("@/_shared/useSafeContext");

const mockChart = {
  api: () => ({}),
};

const mockAttachPrimitive = vi.fn();
const mockDetachPrimitive = vi.fn();

const mockSeries = {
  api: () => ({
    attachPrimitive: mockAttachPrimitive,
    detachPrimitive: mockDetachPrimitive,
  }),
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
});
