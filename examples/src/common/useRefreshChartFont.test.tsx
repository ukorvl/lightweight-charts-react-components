import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useRefreshChartFont } from "./useRefreshChartFont";

describe("useRefreshChartFont", () => {
  it("refreshes with the latest callback after pending fonts load", async () => {
    let resolveFontsReady: () => void = () => {};
    const fontsReady = new Promise<void>(resolve => {
      resolveFontsReady = () => resolve();
    });
    const fontsDescriptor = Object.getOwnPropertyDescriptor(document, "fonts");
    const initialRefresh = vi.fn();
    const latestRefresh = vi.fn();

    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { status: "loading", ready: fontsReady },
    });

    try {
      const { rerender } = renderHook(
        ({ refreshChart }: { refreshChart: () => void }) =>
          useRefreshChartFont(refreshChart),
        { initialProps: { refreshChart: initialRefresh } }
      );

      rerender({ refreshChart: latestRefresh });

      await act(async () => {
        resolveFontsReady();
        await fontsReady;
      });

      expect(initialRefresh).not.toHaveBeenCalled();
      expect(latestRefresh).toHaveBeenCalledOnce();
    } finally {
      if (fontsDescriptor) {
        Object.defineProperty(document, "fonts", fontsDescriptor);
      } else {
        Reflect.deleteProperty(document, "fonts");
      }
    }
  });

  it("does not refresh after unmount while fonts are loading", async () => {
    let resolveFontsReady: () => void = () => {};
    const fontsReady = new Promise<void>(resolve => {
      resolveFontsReady = () => resolve();
    });
    const fontsDescriptor = Object.getOwnPropertyDescriptor(document, "fonts");
    const refreshChart = vi.fn();

    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { status: "loading", ready: fontsReady },
    });

    try {
      const { unmount } = renderHook(() => useRefreshChartFont(refreshChart));

      unmount();

      await act(async () => {
        resolveFontsReady();
        await fontsReady;
      });

      expect(refreshChart).not.toHaveBeenCalled();
    } finally {
      if (fontsDescriptor) {
        Object.defineProperty(document, "fonts", fontsDescriptor);
      } else {
        Reflect.deleteProperty(document, "fonts");
      }
    }
  });
});
