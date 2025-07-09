import { renderHook } from "@testing-library/react";
import { createChart, type IChartApi } from "lightweight-charts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defaultChartOptions } from "./defaultChartOptions";
import { useChart } from "./useChart";
import type { UseChartOptions } from "./types";

vi.mock("lightweight-charts");

const mockRemoveChart = vi.fn();
const mockApplyOptions = vi.fn();
const mockSubscribeClick = vi.fn();
const mockUnsubscribeClick = vi.fn();
const mockSubscribeCrosshairMove = vi.fn();
const mockUnsubscribeCrosshairMove = vi.fn();
const mockSubscribeDblClick = vi.fn();
const mockUnsubscribeDblClick = vi.fn();

const mockContainer = document.createElement("div");
const mockChart: IChartApi = {
  remove: mockRemoveChart,
  applyOptions: mockApplyOptions,
  subscribeClick: mockSubscribeClick,
  unsubscribeClick: mockUnsubscribeClick,
  subscribeCrosshairMove: mockSubscribeCrosshairMove,
  unsubscribeCrosshairMove: mockUnsubscribeCrosshairMove,
  subscribeDblClick: mockSubscribeDblClick,
  unsubscribeDblClick: mockUnsubscribeDblClick,
} as unknown as IChartApi;

describe("useChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create chart", () => {
    vi.mocked(createChart).mockReturnValue(mockChart);

    const { result } = renderHook(() =>
      useChart({
        container: mockContainer,
        options: {},
      })
    );

    const api = result.current.chartApiRef.current.api();
    expect(api).toBeDefined();
    expect(createChart).toHaveBeenCalled();
    expect(mockRemoveChart).not.toHaveBeenCalled();
  });

  it("should clear chart on unmount", () => {
    vi.mocked(createChart).mockReturnValue(mockChart);

    const { unmount } = renderHook(() =>
      useChart({
        container: mockContainer,
        options: {},
      })
    );

    unmount();

    expect(mockRemoveChart).toHaveBeenCalled();
  });

  it("should apply options", () => {
    vi.mocked(createChart).mockReturnValue(mockChart);

    const { rerender } = renderHook(
      props =>
        useChart({
          container: mockContainer,
          options: props.options,
        }),
      {
        initialProps: {
          options: {},
        },
      }
    );

    rerender({
      options: { layout: { backgroundColor: "red" } },
    });

    expect(mockApplyOptions).toHaveBeenCalledWith({
      layout: { backgroundColor: "red" },
      ...defaultChartOptions,
    });
  });

  it("should subscribe to click event", () => {
    vi.mocked(createChart).mockReturnValue(mockChart);

    const onClick = vi.fn();

    const { rerender } = renderHook(
      props =>
        useChart({
          container: mockContainer,
          onClick: props.onClick,
        }),
      {
        initialProps: {
          onClick: undefined,
        } as Partial<UseChartOptions>,
      }
    );

    rerender({
      onClick,
    });

    expect(mockSubscribeClick).toHaveBeenCalledWith(onClick);
    expect(mockUnsubscribeClick).not.toHaveBeenCalled();
  });

  it("should unsubscribe from click event", () => {
    vi.mocked(createChart).mockReturnValue(mockChart);

    const onClick = vi.fn();

    const { rerender } = renderHook(
      props =>
        useChart({
          container: mockContainer,
          onClick: props.onClick,
        }),
      {
        initialProps: {
          onClick,
        } as Partial<UseChartOptions>,
      }
    );

    rerender({
      onClick: undefined,
    });

    expect(mockUnsubscribeClick).toHaveBeenCalled();
  });

  it("should subscribe to crosshair move event", () => {
    vi.mocked(createChart).mockReturnValue(mockChart);

    const onCrosshairMove = vi.fn();

    const { rerender } = renderHook(
      props =>
        useChart({
          container: mockContainer,
          onCrosshairMove: props.onCrosshairMove,
        }),
      {
        initialProps: {
          onCrosshairMove: undefined,
        } as Partial<UseChartOptions>,
      }
    );

    rerender({
      onCrosshairMove,
    });

    expect(mockSubscribeCrosshairMove).toHaveBeenCalledWith(onCrosshairMove);
    expect(mockUnsubscribeCrosshairMove).not.toHaveBeenCalled();
  });

  it("should unsubscribe from crosshair move event", () => {
    vi.mocked(createChart).mockReturnValue(mockChart);

    const onCrosshairMove = vi.fn();

    const { rerender } = renderHook(
      props =>
        useChart({
          container: mockContainer,
          onCrosshairMove: props.onCrosshairMove,
        }),
      {
        initialProps: {
          onCrosshairMove,
        } as Partial<UseChartOptions>,
      }
    );

    rerender({
      onCrosshairMove: undefined,
    });

    expect(mockUnsubscribeCrosshairMove).toHaveBeenCalled();
  });

  it("should subscribe to double click event", () => {
    vi.mocked(createChart).mockReturnValue(mockChart);

    const onDblClick = vi.fn();

    const { rerender } = renderHook(
      props =>
        useChart({
          container: mockContainer,
          onDblClick: props.onDblClick,
        }),
      {
        initialProps: {
          onDblClick: undefined,
        } as Partial<UseChartOptions>,
      }
    );

    rerender({
      onDblClick,
    });

    expect(mockSubscribeDblClick).toHaveBeenCalledWith(onDblClick);
    expect(mockUnsubscribeDblClick).not.toHaveBeenCalled();
  });

  it("should unsubscribe from double click event", () => {
    vi.mocked(createChart).mockReturnValue(mockChart);

    const onDblClick = vi.fn();

    const { rerender } = renderHook(
      props =>
        useChart({
          container: mockContainer,
          onDblClick: props.onDblClick,
        }),
      {
        initialProps: {
          onDblClick,
        } as Partial<UseChartOptions>,
      }
    );

    rerender({
      onDblClick: undefined,
    });

    expect(mockUnsubscribeDblClick).toHaveBeenCalled();
  });
});
