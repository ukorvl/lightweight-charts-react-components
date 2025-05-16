import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSafeContext } from "@/_shared/useSafeContext";
import { usePriceLine } from "./usePriceLine";

vi.mock("@/_shared/useSafeContext");
vi.mock("lightweight-charts");

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
});
