import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSafeContext } from "@/_shared/useSafeContext";
import { usePriceLine } from "./usePriceLine";
import type { PriceLineProps } from "./types";

vi.mock("@/_shared/useSafeContext");

const mockCreatePriceLine = vi.fn().mockReturnValue({
  applyOptions: vi.fn(),
  options: vi.fn(),
});

const mockRemovePriceLine = vi.fn();

const mockSeries = {
  api: () => ({
    createPriceLine: mockCreatePriceLine,
    removePriceLine: mockRemovePriceLine,
  }),
};

describe("usePriceLine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    expect(api).toBeDefined();
    expect(mockCreatePriceLine).toHaveBeenCalled();
    expect(mockRemovePriceLine).not.toHaveBeenCalled();
  });

  it("should clear the price line on unmount", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      seriesApiRef: mockSeries,
      isReady: true,
    });

    const { unmount } = renderHook(() =>
      usePriceLine({
        price: 100,
      })
    );

    unmount();

    expect(mockRemovePriceLine).toHaveBeenCalled();
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

    rerender({
      price: 100,
      options: newOptions,
    });

    expect(mockCreatePriceLine().applyOptions).toHaveBeenCalledWith(newOptions);
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
});
