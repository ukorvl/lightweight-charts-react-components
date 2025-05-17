import { renderHook } from "@testing-library/react";
import { createSeriesMarkers } from "lightweight-charts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSafeContext } from "@/_shared/useSafeContext";
import { useMarkers } from "./useMarkers";
import type { MarkersProps } from "./types";

vi.mock("@/_shared/useSafeContext");
vi.mock("lightweight-charts");

const mockDetach = vi.fn();
const mockSetMarkers = vi.fn();

const mockSeries = {
  api: () => ({}),
};

vi.mocked(createSeriesMarkers).mockReturnValue({
  setMarkers: mockSetMarkers,
  detach: mockDetach,
  markers: vi.fn(),
  getSeries: vi.fn(),
});

describe("useMarkers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create markers", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      seriesApiRef: mockSeries,
      isReady: true,
    });

    const { result } = renderHook(() =>
      useMarkers({
        markers: [],
      })
    );

    const api = result.current.current.api();
    expect(api).toBeDefined();
    expect(createSeriesMarkers).toHaveBeenCalled();
  });

  it("should detach markers on unmount", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      seriesApiRef: mockSeries,
      isReady: true,
    });

    const { unmount } = renderHook(() =>
      useMarkers({
        markers: [],
      })
    );

    unmount();
    expect(mockDetach).toHaveBeenCalled();
  });

  it("should set markers", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      seriesApiRef: mockSeries,
      isReady: true,
    });

    const { rerender } = renderHook(
      props =>
        useMarkers({
          markers: props.markers,
          reactive: props.reactive,
        }),
      {
        initialProps: {
          markers: [],
          reactive: true,
        } as MarkersProps,
      }
    );

    const newMarkers = [
      {
        time: "time",
        shape: "circle",
        position: "aboveBar",
        color: "red",
        price: 1,
      } as const,
    ];

    rerender({
      markers: newMarkers,
      reactive: true,
    });

    expect(mockSetMarkers).toHaveBeenCalledWith(newMarkers);
  });
});
