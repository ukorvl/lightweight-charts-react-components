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
        options: { zOrder: "top" },
      })
    );

    const api = result.current.current.api();
    expect(api).toBeDefined();
    expect(createSeriesMarkers).toHaveBeenCalledWith({}, [], { zOrder: "top" });
  });

  it("returns the existing markers instance when init is called again", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      seriesApiRef: mockSeries,
      isReady: true,
    });

    const { result } = renderHook(() =>
      useMarkers({
        markers: [],
      })
    );

    const api = result.current.current.init();

    expect(api).toBe(result.current.current.api());
    expect(createSeriesMarkers).toHaveBeenCalledTimes(1);
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

  it("uses reactive marker updates by default", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      seriesApiRef: mockSeries,
      isReady: true,
    });

    const newMarkers = [
      {
        time: "time",
        shape: "circle",
        position: "aboveBar",
        color: "red",
        price: 1,
      } as const,
    ];

    const { rerender } = renderHook(
      props =>
        useMarkers({
          markers: props.markers,
        }),
      {
        initialProps: {
          markers: [],
        } as Pick<MarkersProps, "markers">,
      }
    );

    mockSetMarkers.mockClear();

    rerender({
      markers: newMarkers,
    });

    expect(mockSetMarkers).toHaveBeenCalledWith(newMarkers);
  });

  it("does not set markers when reactive is false", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      seriesApiRef: mockSeries,
      isReady: true,
    });

    const newMarkers = [
      {
        time: "time",
        shape: "circle",
        position: "aboveBar",
        color: "red",
        price: 1,
      } as const,
    ];

    const { rerender } = renderHook(
      props =>
        useMarkers({
          markers: props.markers,
          reactive: props.reactive,
        }),
      {
        initialProps: {
          markers: [],
          reactive: false,
        } as MarkersProps,
      }
    );

    mockSetMarkers.mockClear();

    rerender({
      markers: newMarkers,
      reactive: false,
    });

    expect(mockSetMarkers).not.toHaveBeenCalled();
  });

  it("should not render if series api is null", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      seriesApiRef: {
        api: () => null,
      },
      isReady: true,
    });

    const { result } = renderHook(() =>
      useMarkers({
        markers: [],
      })
    );

    expect(result.current.current.api()).toBeNull();
  });

  it("does not initialize markers when the series ref itself is missing", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      seriesApiRef: null,
      isReady: true,
    });

    const { result } = renderHook(() =>
      useMarkers({
        markers: [],
      })
    );

    expect(result.current.current.api()).toBeNull();
    expect(createSeriesMarkers).not.toHaveBeenCalled();
  });

  it("initializes markers once the series becomes ready", () => {
    const seriesContext = {
      seriesApiRef: mockSeries,
      isReady: false,
    };

    vi.mocked(useSafeContext).mockImplementation(() => seriesContext);

    const { result, rerender } = renderHook(() =>
      useMarkers({
        markers: [],
      })
    );

    expect(result.current.current.api()).toBeNull();
    expect(createSeriesMarkers).not.toHaveBeenCalled();

    seriesContext.isReady = true;
    rerender();

    expect(result.current.current.api()).toBeDefined();
    expect(createSeriesMarkers).toHaveBeenCalledTimes(1);
  });

  it("does not update markers after the series ref becomes unavailable", () => {
    const seriesContext = {
      seriesApiRef: mockSeries,
      isReady: true,
    };

    vi.mocked(useSafeContext).mockImplementation(() => seriesContext);

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

    // we need type assertion here because we are simulating a null value for testing purposes
    seriesContext.seriesApiRef = null as unknown as typeof mockSeries;
    mockSetMarkers.mockClear();

    rerender({
      markers: [
        {
          time: "time",
          shape: "circle",
          position: "aboveBar",
          color: "red",
          price: 1,
        } as const,
      ],
      reactive: true,
    });

    expect(mockSetMarkers).not.toHaveBeenCalled();
  });
});
