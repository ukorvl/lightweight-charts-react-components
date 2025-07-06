import { renderHook } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { PaneContext } from "./PaneContext";
import { usePaneContext } from "./usePaneContext";
import type { PropsWithChildren } from "react";

const mockPaneApiRef = {
  api: vi.fn(),
  init: vi.fn(),
  clear: vi.fn(),
  _pane: null,
};

describe("usePaneContext", () => {
  it("returns the context value when pane is available", () => {
    const wrapper = ({ children }: PropsWithChildren) => (
      <PaneContext.Provider
        value={{
          paneApiRef: mockPaneApiRef,
          isReady: true,
        }}
      >
        {children}
      </PaneContext.Provider>
    );

    const { result } = renderHook(() => usePaneContext(), { wrapper });

    expect(result.current).toStrictEqual({
      isInsidePane: true,
      isPaneReady: true,
      paneApiRef: mockPaneApiRef,
    });
  });

  it("returns correct value if being called outside a pane", () => {
    const wrapper = ({ children }: PropsWithChildren) => (
      <PaneContext.Provider value={null}>{children}</PaneContext.Provider>
    );

    const { result } = renderHook(() => usePaneContext(), { wrapper });

    expect(result.current).toStrictEqual({
      isInsidePane: false,
      isPaneReady: false,
      paneApiRef: undefined,
    });
  });
});
