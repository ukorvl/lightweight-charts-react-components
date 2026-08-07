import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSafeContext } from "@/_shared/useSafeContext";
import { usePriceLine } from "./usePriceLine";
import type { PriceLineProps } from "./types";

vi.mock("@/_shared/useSafeContext");

const mockPriceLineApi = {
  applyOptions: vi.fn(),
  options: vi.fn(),
};

const mockCreatePriceLine = vi.fn(() => mockPriceLineApi);

const mockRemovePriceLine = vi.fn();
const mockSeriesApi = {
  createPriceLine: mockCreatePriceLine,
  removePriceLine: mockRemovePriceLine,
};

const mockSeries = {
  api: vi.fn(() => mockSeriesApi),
};

describe("usePriceLine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSeries.api.mockReturnValue(mockSeriesApi);
  });

  it("should create a price line", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      seriesApiRef: mockSeries,
      isReady: true,
    });

    const { result } = renderHook(() =>
      usePriceLine({
        price: 100,
      })
    );

    const api = result.current.current.api();
    expect(api).toBe(mockPriceLineApi);
    expect(mockCreatePriceLine).toHaveBeenCalledWith({ price: 100 });
    expect(mockRemovePriceLine).not.toHaveBeenCalled();
  });

  it("returns the existing price line instance when init is called again", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      seriesApiRef: mockSeries,
      isReady: true,
    });

    const { result } = renderHook(() =>
      usePriceLine({
        price: 100,
      })
    );

    const api = result.current.current.init();

    expect(api).toBe(result.current.current.api());
    expect(mockCreatePriceLine).toHaveBeenCalledTimes(1);
  });

  it("should clear the price line on unmount", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      seriesApiRef: mockSeries,
      isReady: true,
    });

    const { result, unmount } = renderHook(() =>
      usePriceLine({
        price: 100,
      })
    );

    expect(result.current.current.api()).toBeDefined();

    unmount();

    expect(mockRemovePriceLine).toHaveBeenCalledWith(mockPriceLineApi);
    expect(result.current.current.api()).toBeNull();
  });

  it("should apply options to the price line", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      seriesApiRef: mockSeries,
      isReady: true,
    });

    const { rerender } = renderHook(
      props =>
        usePriceLine({
          price: props.price,
          options: props.options,
        }),
      {
        initialProps: {
          price: 100,
          options: {
            color: "blue",
          },
        } as PriceLineProps,
      }
    );

    const newOptions = {
      color: "red",
    };

    mockPriceLineApi.applyOptions.mockClear();
    rerender({
      price: 100,
      options: newOptions,
    });

    expect(mockPriceLineApi.applyOptions).toHaveBeenCalledWith(newOptions);
  });

  it("passes initial price line options during creation", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      seriesApiRef: mockSeries,
      isReady: true,
    });

    renderHook(() =>
      usePriceLine({
        price: 100,
        options: {
          color: "blue",
          lineStyle: 1,
        },
      })
    );

    expect(mockCreatePriceLine).toHaveBeenCalledWith({
      price: 100,
      color: "blue",
      lineStyle: 1,
    });
  });

  it("should apply a zero price update", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      seriesApiRef: mockSeries,
      isReady: true,
    });

    const { rerender } = renderHook(
      props =>
        usePriceLine({
          price: props.price,
        }),
      {
        initialProps: {
          price: 100,
        } as PriceLineProps,
      }
    );

    mockPriceLineApi.applyOptions.mockClear();
    rerender({
      price: 0,
    });

    expect(mockPriceLineApi.applyOptions).toHaveBeenLastCalledWith({ price: 0 });
  });

  it("does not apply options when no options are provided", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      seriesApiRef: mockSeries,
      isReady: true,
    });

    const { rerender } = renderHook(
      props =>
        usePriceLine({
          price: props.price,
          options: props.options,
        }),
      {
        initialProps: {
          price: 100,
          options: undefined,
        } as PriceLineProps,
      }
    );

    mockPriceLineApi.applyOptions.mockClear();

    rerender({
      price: 100,
      options: undefined,
    });

    expect(mockPriceLineApi.applyOptions).not.toHaveBeenCalled();
  });

  it("should not create a price line if not ready", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      seriesApiRef: mockSeries,
      isReady: false,
    });

    const { result } = renderHook(() =>
      usePriceLine({
        price: 100,
      })
    );

    const api = result.current.current.api();
    expect(api).toBeNull();
    expect(mockCreatePriceLine).not.toHaveBeenCalled();
  });

  it("should not create a price line if no seriesApiRef", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      seriesApiRef: null,
      isReady: true,
    });

    const { result } = renderHook(() =>
      usePriceLine({
        price: 100,
      })
    );

    const api = result.current.current.api();
    expect(api).toBeNull();
    expect(mockCreatePriceLine).not.toHaveBeenCalled();
  });

  it("initializes once the series becomes ready", () => {
    const seriesContext: {
      seriesApiRef: typeof mockSeries | null;
      isReady: boolean;
    } = {
      seriesApiRef: mockSeries,
      isReady: false,
    };

    vi.mocked(useSafeContext).mockImplementation(() => seriesContext);

    const { result, rerender } = renderHook(() =>
      usePriceLine({
        price: 100,
      })
    );

    expect(result.current.current.api()).toBeNull();
    expect(mockCreatePriceLine).not.toHaveBeenCalled();

    seriesContext.isReady = true;
    rerender();

    expect(result.current.current.api()).toBeDefined();
    expect(mockCreatePriceLine).toHaveBeenCalledTimes(1);
  });

  it("does not apply options before the price line is initialized", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      seriesApiRef: mockSeries,
      isReady: false,
    });

    const { rerender } = renderHook(
      props =>
        usePriceLine({
          price: props.price,
          options: props.options,
        }),
      {
        initialProps: {
          price: 100,
          options: {
            color: "blue",
          },
        } as PriceLineProps,
      }
    );

    rerender({
      price: 100,
      options: {
        color: "red",
      },
    });

    expect(mockCreatePriceLine).not.toHaveBeenCalled();
    expect(mockPriceLineApi.applyOptions).not.toHaveBeenCalled();
  });

  it("does not apply price updates before the price line is initialized", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      seriesApiRef: mockSeries,
      isReady: false,
    });

    const { rerender } = renderHook(
      props =>
        usePriceLine({
          price: props.price,
        }),
      {
        initialProps: {
          price: 100,
        } as PriceLineProps,
      }
    );

    rerender({
      price: 200,
    });

    expect(mockCreatePriceLine).not.toHaveBeenCalled();
    expect(mockPriceLineApi.applyOptions).not.toHaveBeenCalled();
  });

  it("does not update the price line when the series ref becomes unavailable", () => {
    const seriesContext: {
      seriesApiRef: typeof mockSeries | null;
      isReady: boolean;
    } = {
      seriesApiRef: mockSeries,
      isReady: true,
    };

    vi.mocked(useSafeContext).mockImplementation(() => seriesContext);

    const { rerender } = renderHook(
      props =>
        usePriceLine({
          price: props.price,
          options: props.options,
        }),
      {
        initialProps: {
          price: 100,
          options: {
            color: "blue",
          },
        } as PriceLineProps,
      }
    );

    seriesContext.seriesApiRef = null;
    mockPriceLineApi.applyOptions.mockClear();

    rerender({
      price: 200,
      options: {
        color: "red",
      },
    });

    expect(mockPriceLineApi.applyOptions).not.toHaveBeenCalled();
  });

  it("does not throw when the series api is unavailable during cleanup", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      seriesApiRef: mockSeries,
      isReady: true,
    });
    mockSeries.api
      .mockReturnValueOnce(mockSeriesApi)
      .mockReturnValueOnce(undefined as unknown as typeof mockSeriesApi);

    const { unmount } = renderHook(() =>
      usePriceLine({
        price: 100,
      })
    );

    expect(() => unmount()).not.toThrow();
    expect(mockRemovePriceLine).not.toHaveBeenCalled();
  });
});
