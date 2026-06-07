import { renderHook } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSafeContext } from "@/_shared/useSafeContext";
import { PaneContext } from "@/pane/PaneContext";
import { usePanePrimitive } from "./usePanePrimitive";
import type { PropsWithChildren } from "react";

vi.mock("@/_shared/useSafeContext");

const mockChartApi = {};
const mockChart = {
  api: () => mockChartApi,
};

const mockAttachPrimitive = vi.fn();
const mockDetachPrimitive = vi.fn();
const mockPaneApi = {
  attachPrimitive: mockAttachPrimitive,
  detachPrimitive: mockDetachPrimitive,
};

const createPaneContextWrapper = ({
  isReady = true,
  paneApi = mockPaneApi,
}: {
  isReady?: boolean;
  paneApi?: typeof mockPaneApi | null;
} = {}) => {
  // eslint-disable-next-line react/display-name
  return ({ children }: PropsWithChildren) => (
    <PaneContext.Provider
      value={{
        isReady,
        paneApiRef: {
          _pane: null,
          api: () => paneApi as never,
          init: () => paneApi as never,
          clear: vi.fn(),
        },
      }}
    >
      {children}
    </PaneContext.Provider>
  );
};

describe("usePanePrimitive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes panePrimitive", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    const { result } = renderHook(
      () =>
        usePanePrimitive({
          plugin: {},
        }),
      {
        wrapper: createPaneContextWrapper(),
      }
    );

    const api = result.current.current.api();
    expect(api).toBeDefined();
    expect(mockAttachPrimitive).toHaveBeenCalledWith({});
  });

  it("does not initialize panePrimitive if chart is not ready", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: false,
      chartApiRef: mockChart,
    });

    const { result } = renderHook(
      () =>
        usePanePrimitive({
          plugin: {},
        }),
      {
        wrapper: createPaneContextWrapper(),
      }
    );

    expect(result.current.current.api()).toBeNull();
    expect(mockAttachPrimitive).not.toHaveBeenCalled();
  });

  it("calls render function if provided", () => {
    const renderMock = vi.fn().mockReturnValue({});

    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    renderHook(
      () =>
        usePanePrimitive({
          render: renderMock,
        }),
      {
        wrapper: createPaneContextWrapper(),
      }
    );

    expect(renderMock).toHaveBeenCalledWith({
      chart: mockChartApi,
      pane: mockPaneApi,
    });
    expect(mockAttachPrimitive).toHaveBeenCalled();
  });

  it("clears primitive on unmount", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    const { unmount } = renderHook(
      () =>
        usePanePrimitive({
          plugin: {},
        }),
      {
        wrapper: createPaneContextWrapper(),
      }
    );

    unmount();
    expect(mockDetachPrimitive).toHaveBeenCalled();
  });

  it("throws when used outside a pane", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    expect(() =>
      renderHook(() =>
        usePanePrimitive({
          plugin: {},
        })
      )
    ).toThrowError(/PanePrimitive must be used inside a pane/);
  });

  it("does not initialize panePrimitive if pane is not ready", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    const { result } = renderHook(
      () =>
        usePanePrimitive({
          plugin: {},
        }),
      {
        wrapper: createPaneContextWrapper({ isReady: false }),
      }
    );

    expect(result.current.current.api()).toBeNull();
    expect(mockAttachPrimitive).not.toHaveBeenCalled();
  });

  it("does not initialize panePrimitive if chart api is unavailable", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: null,
    });

    const { result } = renderHook(
      () =>
        usePanePrimitive({
          plugin: {},
        }),
      {
        wrapper: createPaneContextWrapper(),
      }
    );

    expect(result.current.current.api()).toBeNull();
    expect(mockAttachPrimitive).not.toHaveBeenCalled();
  });

  it("does not initialize panePrimitive if pane api is unavailable", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    const { result } = renderHook(
      () =>
        usePanePrimitive({
          plugin: {},
        }),
      {
        wrapper: createPaneContextWrapper({ paneApi: null }),
      }
    );

    expect(result.current.current.api()).toBeNull();
    expect(mockAttachPrimitive).not.toHaveBeenCalled();
  });
});
