import { renderHook } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSafeContext } from "@/_shared/useSafeContext";
import { PaneContext } from "@/pane/PaneContext";
import { usePanePrimitive } from "./usePanePrimitive";
import type { PropsWithChildren } from "react";

vi.mock("@/_shared/useSafeContext");

const createMockPaneApi = () => ({
  attachPrimitive: vi.fn(),
  detachPrimitive: vi.fn(),
});

const mockChartApi = {};
const mockChart = {
  api: () => mockChartApi,
};

const mockPaneApi = createMockPaneApi();
const { attachPrimitive: mockAttachPrimitive, detachPrimitive: mockDetachPrimitive } =
  mockPaneApi;

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

const createDynamicPaneContextWrapper = ({
  isReady = true,
  getPaneApi,
}: {
  isReady?: boolean;
  getPaneApi: () => ReturnType<typeof createMockPaneApi> | null;
}) => {
  // eslint-disable-next-line react/display-name
  return ({ children }: PropsWithChildren) => (
    <PaneContext.Provider
      value={{
        isReady,
        paneApiRef: {
          _pane: null,
          api: () => getPaneApi() as never,
          init: () => getPaneApi() as never,
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

  it("reinitializes panePrimitive when the plugin object changes", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    const initialPlugin = { id: "initial" };
    const nextPlugin = { id: "next" };

    const { rerender, result } = renderHook(
      ({ pluginToUse }: { pluginToUse: object }) =>
        usePanePrimitive({
          plugin: pluginToUse,
        }),
      {
        initialProps: { pluginToUse: initialPlugin },
        wrapper: createPaneContextWrapper(),
      }
    );

    rerender({ pluginToUse: nextPlugin });

    expect(mockDetachPrimitive).toHaveBeenCalledWith(initialPlugin);
    expect(mockAttachPrimitive).toHaveBeenLastCalledWith(nextPlugin);
    expect(result.current.current.api()).toBe(nextPlugin);
  });

  it("reinitializes panePrimitive when the render callback changes", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    const initialPrimitive = { id: "initial-rendered" };
    const nextPrimitive = { id: "next-rendered" };
    const initialRender = vi.fn().mockReturnValue(initialPrimitive);
    const nextRender = vi.fn().mockReturnValue(nextPrimitive);

    const { rerender, result } = renderHook(
      ({ renderPrimitive }: { renderPrimitive: typeof initialRender }) =>
        usePanePrimitive({
          render: renderPrimitive,
        }),
      {
        initialProps: { renderPrimitive: initialRender },
        wrapper: createPaneContextWrapper(),
      }
    );

    rerender({ renderPrimitive: nextRender });

    expect(mockDetachPrimitive).toHaveBeenCalledWith(initialPrimitive);
    expect(nextRender).toHaveBeenCalledWith({
      chart: mockChartApi,
      pane: mockPaneApi,
    });
    expect(mockAttachPrimitive).toHaveBeenLastCalledWith(nextPrimitive);
    expect(result.current.current.api()).toBe(nextPrimitive);
  });

  it("detaches panePrimitive from the original pane when pane context changes before reinitialization", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    const initialPlugin = { id: "initial" };
    const nextPlugin = { id: "next" };
    const initialPaneApi = createMockPaneApi();
    const nextPaneApi = createMockPaneApi();
    let currentPaneApi = initialPaneApi;

    const { rerender } = renderHook(
      ({ pluginToUse }: { pluginToUse: object }) =>
        usePanePrimitive({
          plugin: pluginToUse,
        }),
      {
        initialProps: { pluginToUse: initialPlugin },
        wrapper: createDynamicPaneContextWrapper({
          getPaneApi: () => currentPaneApi,
        }),
      }
    );

    currentPaneApi = nextPaneApi;
    rerender({ pluginToUse: initialPlugin });
    rerender({ pluginToUse: nextPlugin });

    expect(initialPaneApi.detachPrimitive).toHaveBeenCalledWith(initialPlugin);
    expect(nextPaneApi.detachPrimitive).not.toHaveBeenCalled();
    expect(nextPaneApi.attachPrimitive).toHaveBeenCalledWith(nextPlugin);
  });

  it("detaches panePrimitive from the original pane on unmount after pane context changes", () => {
    vi.mocked(useSafeContext).mockReturnValue({
      isReady: true,
      chartApiRef: mockChart,
    });

    const initialPlugin = { id: "initial" };
    const initialPaneApi = createMockPaneApi();
    const nextPaneApi = createMockPaneApi();
    let currentPaneApi = initialPaneApi;

    const { rerender, unmount } = renderHook(
      ({ pluginToUse }: { pluginToUse: object }) =>
        usePanePrimitive({
          plugin: pluginToUse,
        }),
      {
        initialProps: { pluginToUse: initialPlugin },
        wrapper: createDynamicPaneContextWrapper({
          getPaneApi: () => currentPaneApi,
        }),
      }
    );

    currentPaneApi = nextPaneApi;
    rerender({ pluginToUse: initialPlugin });
    unmount();

    expect(initialPaneApi.detachPrimitive).toHaveBeenCalledWith(initialPlugin);
    expect(nextPaneApi.detachPrimitive).not.toHaveBeenCalled();
  });
});
