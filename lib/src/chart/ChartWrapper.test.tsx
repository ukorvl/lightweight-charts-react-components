import { render } from "@testing-library/react";
import {
  createChart,
  createChartEx,
  createOptionsChart,
  createYieldCurveChart,
  type IChartApi,
  type IChartApiBase,
  type IYieldCurveChartApi,
  type Time,
} from "lightweight-charts";
import { createRef } from "react";
import React from "react";
import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { ChartWrapper } from "./ChartWrapper";
import { CustomChart } from "./CustomChart";
import { OptionsChart } from "./OptionsChart";
import { YieldCurveChart } from "./YieldCurveChart";
import type { ChartApiRef, ChartProps } from "./types";

vi.mock("lightweight-charts", () => ({
  createChart: vi.fn(),
  createChartEx: vi.fn(),
  createOptionsChart: vi.fn(),
  createYieldCurveChart: vi.fn(),
}));

const mockChart = {
  remove: vi.fn(),
  applyOptions: vi.fn(),
  subscribeClick: vi.fn(),
  unsubscribeClick: vi.fn(),
  subscribeCrosshairMove: vi.fn(),
  unsubscribeCrosshairMove: vi.fn(),
  subscribeDblClick: vi.fn(),
  unsubscribeDblClick: vi.fn(),
} as unknown as IChartApi;
const mockOptionsChart = mockChart as unknown as IChartApiBase<number>;
const mockYieldCurveChart = mockChart as unknown as IYieldCurveChartApi;
const mockCustomChart = mockChart as unknown as IChartApiBase<unknown>;

describe("ChartWrapper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createChart).mockReturnValue(mockChart);
    vi.mocked(createOptionsChart).mockReturnValue(mockOptionsChart);
    vi.mocked(createYieldCurveChart).mockReturnValue(mockYieldCurveChart);
    vi.mocked(createChartEx).mockReturnValue(mockCustomChart);
  });

  const customScaleBehavior = {} as never;

  // Runtime JS callers can still pass `ref` through containerProps.
  const withRef = (ref: unknown) =>
    ({ ref }) as NonNullable<ChartProps["containerProps"]>;

  it.each([
    { name: "ChartWrapper", Chart: ChartWrapper, create: createChart },
    { name: "OptionsChart", Chart: OptionsChart, create: createOptionsChart },
    { name: "YieldCurveChart", Chart: YieldCurveChart, create: createYieldCurveChart },
    {
      name: "CustomChart",
      Chart: (props: Pick<ChartProps, "containerProps" | "containerRef">) => (
        <CustomChart {...props} horzScaleBehavior={customScaleBehavior} />
      ),
      create: createChartEx,
    },
  ])(
    "mounts $name and forwards refs passed through containerProps",
    ({ Chart, create }) => {
      const containerRef = createRef<HTMLDivElement>();
      const objectRef = createRef<HTMLDivElement>();
      const callbackRef = vi.fn();
      const firstProps = { className: "chart", ref: objectRef };
      const secondProps = { className: "chart", ref: callbackRef };

      const { rerender, unmount } = render(
        <Chart containerProps={firstProps} containerRef={containerRef} />
      );
      const node = containerRef.current;

      expect(node).toBeInstanceOf(HTMLDivElement);
      expect(objectRef.current).toBe(node);
      expect(vi.mocked(create).mock.calls[0]?.[0]).toBe(node);

      rerender(<Chart containerProps={secondProps} containerRef={containerRef} />);

      expect(objectRef.current).toBeNull();
      expect(callbackRef).toHaveBeenCalledExactlyOnceWith(node);
      expect(containerRef.current).toBe(node);
      expect(create).toHaveBeenCalledTimes(1);

      unmount();

      expect(callbackRef).toHaveBeenLastCalledWith(null);
      expect(containerRef.current).toBeNull();
    }
  );

  it("mounts with the dedicated ref when containerProps contains a string ref", () => {
    const containerProps = { className: "chart", ref: "legacy" };
    const containerRef = createRef<HTMLDivElement>();
    const chartRef = createRef<ChartApiRef<Time, IChartApi>>();

    render(
      <ChartWrapper
        ref={chartRef}
        containerProps={containerProps}
        containerRef={containerRef}
      />
    );

    expect(containerRef.current).toBeInstanceOf(HTMLDivElement);
    expect(chartRef.current?.api()).toBe(mockChart);
  });

  it("runs callback ref cleanup once when the same ref is passed in both props", () => {
    const cleanup = vi.fn();
    const ref = vi.fn<React.RefCallback<HTMLDivElement>>(() => cleanup);
    const containerProps = { className: "chart", ref };

    const { rerender } = render(
      <ChartWrapper containerProps={containerProps} containerRef={ref} />
    );

    expect(ref).toHaveBeenCalledExactlyOnceWith(expect.any(HTMLDivElement));
    expect(cleanup).not.toHaveBeenCalled();

    rerender(<ChartWrapper />);

    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(ref).toHaveBeenCalledTimes(1);
  });

  it("keeps a stable ref attached when only the other ref changes", () => {
    const stableCleanup = vi.fn();
    const stableRef = vi.fn<React.RefCallback<HTMLDivElement>>(() => stableCleanup);
    const firstRef = vi.fn();
    const secondRef = vi.fn();

    const { rerender } = render(
      <ChartWrapper containerProps={withRef(firstRef)} containerRef={stableRef} />
    );
    const node = stableRef.mock.calls[0]?.[0];

    rerender(
      <ChartWrapper containerProps={withRef(secondRef)} containerRef={stableRef} />
    );

    expect(stableRef).toHaveBeenCalledExactlyOnceWith(node);
    expect(stableCleanup).not.toHaveBeenCalled();
    expect(firstRef).toHaveBeenLastCalledWith(null);
    expect(secondRef).toHaveBeenCalledExactlyOnceWith(node);

    rerender(
      <ChartWrapper containerProps={withRef(secondRef)} containerRef={undefined} />
    );

    expect(stableCleanup).toHaveBeenCalledTimes(1);
    expect(secondRef).toHaveBeenCalledTimes(1);
    expect(createChart).toHaveBeenCalledTimes(1);
  });

  it("does not loop when a stable ref stores layout in parent state", () => {
    const Parent = () => {
      const [, setWidth] = React.useState(0);
      const stableRef = React.useCallback((node: HTMLDivElement | null) => {
        setWidth(Math.random());
        void node;
      }, []);

      return (
        <ChartWrapper
          containerProps={withRef((node: HTMLDivElement | null) => void node)}
          containerRef={stableRef}
        />
      );
    };

    expect(() => render(<Parent />)).not.toThrow();
    expect(createChart).toHaveBeenCalledTimes(1);
  });

  it("clears the other ref when a callback ref cleanup throws", () => {
    const error = new Error("cleanup failed");
    const throwingRef = vi.fn<React.RefCallback<HTMLDivElement>>(() => () => {
      throw error;
    });
    const objectRef = createRef<HTMLDivElement>();
    const { unmount } = render(
      <ChartWrapper containerProps={withRef(objectRef)} containerRef={throwingRef} />
    );

    expect(objectRef.current).toBeInstanceOf(HTMLDivElement);
    expect(() => unmount()).toThrow(error);
    expect(objectRef.current).toBeNull();
  });

  it("keeps the chart and refs attached after StrictMode replays the ref", () => {
    const chartRef = createRef<ChartApiRef<Time, IChartApi>>();
    const containerRef = createRef<HTMLDivElement>();
    const callbackRef = vi.fn((node: HTMLDivElement | null) => node);
    const containerProps = { className: "chart", ref: callbackRef };

    const { unmount } = render(
      <React.StrictMode>
        <ChartWrapper
          ref={chartRef}
          containerProps={containerProps}
          containerRef={containerRef}
        />
      </React.StrictMode>
    );

    const node = containerRef.current;
    expect(node).toBeInstanceOf(HTMLDivElement);
    expect(callbackRef.mock.calls).toEqual([[node]]);
    expect(chartRef.current?.api()).toBe(mockChart);
    expect(createChart).toHaveBeenCalledTimes(2);
    expect(mockChart.remove).toHaveBeenCalledTimes(1);

    unmount();

    expect(callbackRef).toHaveBeenLastCalledWith(null);
    expect(containerRef.current).toBeNull();
    expect(mockChart.remove).toHaveBeenCalledTimes(2);
  });

  it("renders children when container is set", () => {
    const { getByText } = render(
      <ChartWrapper>
        <div>Chart Content</div>
      </ChartWrapper>
    );

    expect(getByText("Chart Content")).toBeInTheDocument();
  });

  it("forwards chart api object refs on ChartWrapper", () => {
    const ref = createRef<ChartApiRef<Time, IChartApi>>();

    render(
      <ChartWrapper ref={ref}>
        <div>Child</div>
      </ChartWrapper>
    );

    expect(ref.current?.api()).toBe(mockChart);
  });

  it("forwards chart api function refs on ChartWrapper", () => {
    const ref = vi.fn();

    render(
      <ChartWrapper ref={ref}>
        <div>Child</div>
      </ChartWrapper>
    );

    expect(ref).toHaveBeenCalledWith(
      expect.objectContaining({
        api: expect.any(Function),
      })
    );
  });

  it("forwards object container refs on ChartWrapper", () => {
    const containerRef = createRef<HTMLDivElement>();

    render(
      <ChartWrapper containerRef={containerRef}>
        <div>Child</div>
      </ChartWrapper>
    );

    expect(containerRef.current).toBeInstanceOf(HTMLDivElement);
  });

  it("forwards function container refs on ChartWrapper", () => {
    const containerRef = vi.fn();

    render(
      <ChartWrapper containerRef={containerRef}>
        <div>Child</div>
      </ChartWrapper>
    );

    expect(containerRef).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it("updates function container refs when the ChartWrapper ref prop changes", () => {
    const firstContainerRef = vi.fn();
    const secondContainerRef = vi.fn();
    const containerProps = { className: "chart" };

    const { rerender } = render(
      <ChartWrapper containerProps={containerProps} containerRef={firstContainerRef}>
        <div>Child</div>
      </ChartWrapper>
    );

    const node = firstContainerRef.mock.calls[0]?.[0];
    expect(node).toBeInstanceOf(HTMLDivElement);

    rerender(
      <ChartWrapper containerProps={containerProps} containerRef={secondContainerRef}>
        <div>Child</div>
      </ChartWrapper>
    );

    expect(firstContainerRef).toHaveBeenLastCalledWith(null);
    expect(secondContainerRef).toHaveBeenCalledWith(node);
    expect(createChart).toHaveBeenCalledTimes(1);
  });

  it("handles containerProps correctly", () => {
    expectTypeOf<NonNullable<ChartProps["containerProps"]>>().not.toHaveProperty("ref");

    const { getByRole } = render(
      <ChartWrapper containerProps={{ role: "main" }}>
        <div>Child</div>
      </ChartWrapper>
    );

    expect(getByRole("main", { hidden: true })).toBeInTheDocument();
  });

  it("hides chart containers from the accessibility tree by default", () => {
    const { container } = render(
      <ChartWrapper>
        <div>Child</div>
      </ChartWrapper>
    );

    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("allows overriding default chart container accessibility props", () => {
    const { container } = render(
      <ChartWrapper
        containerProps={{ "aria-hidden": false, "aria-label": "Price chart" }}
      >
        <div>Child</div>
      </ChartWrapper>
    );

    expect(container.firstChild).toHaveAttribute("aria-hidden", "false");
    expect(container.firstChild).toHaveAttribute("aria-label", "Price chart");
  });

  it("creates options charts with createOptionsChart", () => {
    render(
      <OptionsChart>
        <div>Child</div>
      </OptionsChart>
    );

    expect(createOptionsChart).toHaveBeenCalledWith(expect.any(HTMLDivElement), {
      addDefaultPane: false,
    });
  });

  it("forwards chart api object refs on OptionsChart", () => {
    const ref = createRef<ChartApiRef<number, IChartApiBase<number>>>();

    render(
      <OptionsChart ref={ref}>
        <div>Child</div>
      </OptionsChart>
    );

    expect(ref.current?.api()).toBe(mockChart);
  });

  it("forwards container refs on OptionsChart", () => {
    const containerRef = createRef<HTMLDivElement>();

    render(
      <OptionsChart containerRef={containerRef}>
        <div>Child</div>
      </OptionsChart>
    );

    expect(containerRef.current).toBeInstanceOf(HTMLDivElement);
  });

  it("updates function container refs on OptionsChart when the prop changes", () => {
    const firstContainerRef = vi.fn();
    const secondContainerRef = vi.fn();

    const { rerender } = render(
      <OptionsChart containerRef={firstContainerRef}>
        <div>Child</div>
      </OptionsChart>
    );

    const node = firstContainerRef.mock.calls[0]?.[0];
    expect(node).toBeInstanceOf(HTMLDivElement);

    rerender(
      <OptionsChart containerRef={secondContainerRef}>
        <div>Child</div>
      </OptionsChart>
    );

    expect(firstContainerRef).toHaveBeenLastCalledWith(null);
    expect(secondContainerRef).toHaveBeenCalledWith(node);
  });

  it("hides OptionsChart containers from the accessibility tree by default", () => {
    const { container } = render(
      <OptionsChart>
        <div>Child</div>
      </OptionsChart>
    );

    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("allows overriding OptionsChart container accessibility props", () => {
    const { container } = render(
      <OptionsChart
        containerProps={{ "aria-hidden": false, "aria-label": "Options chart" }}
      >
        <div>Child</div>
      </OptionsChart>
    );

    expect(container.firstChild).toHaveAttribute("aria-hidden", "false");
    expect(container.firstChild).toHaveAttribute("aria-label", "Options chart");
  });

  it("creates yield curve charts with createYieldCurveChart", () => {
    render(
      <YieldCurveChart>
        <div>Child</div>
      </YieldCurveChart>
    );

    expect(createYieldCurveChart).toHaveBeenCalledWith(expect.any(HTMLDivElement), {
      addDefaultPane: false,
    });
  });

  it("forwards chart api object refs on YieldCurveChart", () => {
    const ref = createRef<ChartApiRef<number, IYieldCurveChartApi>>();

    render(
      <YieldCurveChart ref={ref}>
        <div>Child</div>
      </YieldCurveChart>
    );

    expect(ref.current?.api()).toBe(mockChart);
  });

  it("forwards container refs on YieldCurveChart", () => {
    const containerRef = createRef<HTMLDivElement>();

    render(
      <YieldCurveChart containerRef={containerRef}>
        <div>Child</div>
      </YieldCurveChart>
    );

    expect(containerRef.current).toBeInstanceOf(HTMLDivElement);
  });

  it("updates function container refs on YieldCurveChart when the prop changes", () => {
    const firstContainerRef = vi.fn();
    const secondContainerRef = vi.fn();

    const { rerender } = render(
      <YieldCurveChart containerRef={firstContainerRef}>
        <div>Child</div>
      </YieldCurveChart>
    );

    const node = firstContainerRef.mock.calls[0]?.[0];
    expect(node).toBeInstanceOf(HTMLDivElement);

    rerender(
      <YieldCurveChart containerRef={secondContainerRef}>
        <div>Child</div>
      </YieldCurveChart>
    );

    expect(firstContainerRef).toHaveBeenLastCalledWith(null);
    expect(secondContainerRef).toHaveBeenCalledWith(node);
  });

  it("hides YieldCurveChart containers from the accessibility tree by default", () => {
    const { container } = render(
      <YieldCurveChart>
        <div>Child</div>
      </YieldCurveChart>
    );

    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("allows overriding YieldCurveChart container accessibility props", () => {
    const { container } = render(
      <YieldCurveChart
        containerProps={{ "aria-hidden": false, "aria-label": "Yield curve chart" }}
      >
        <div>Child</div>
      </YieldCurveChart>
    );

    expect(container.firstChild).toHaveAttribute("aria-hidden", "false");
    expect(container.firstChild).toHaveAttribute("aria-label", "Yield curve chart");
  });

  it("delegates custom chart creation to createChartEx", () => {
    const horzScaleBehavior = { options: vi.fn() } as never;

    render(
      <CustomChart horzScaleBehavior={horzScaleBehavior}>
        <div>Child</div>
      </CustomChart>
    );

    expect(createChartEx).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      horzScaleBehavior,
      {
        addDefaultPane: false,
      }
    );
  });

  it("forwards chart api object refs on CustomChart", () => {
    const ref = createRef<ChartApiRef<Time, IChartApiBase<Time>>>();

    render(
      <CustomChart horzScaleBehavior={{} as never} ref={ref}>
        <div>Child</div>
      </CustomChart>
    );

    expect(ref.current?.api()).toBe(mockChart);
  });

  it("forwards container refs on CustomChart", () => {
    const containerRef = createRef<HTMLDivElement>();

    render(
      <CustomChart horzScaleBehavior={{} as never} containerRef={containerRef}>
        <div>Child</div>
      </CustomChart>
    );

    expect(containerRef.current).toBeInstanceOf(HTMLDivElement);
  });

  it("updates function container refs on CustomChart when the prop changes", () => {
    const firstContainerRef = vi.fn();
    const secondContainerRef = vi.fn();

    const { rerender } = render(
      <CustomChart horzScaleBehavior={{} as never} containerRef={firstContainerRef}>
        <div>Child</div>
      </CustomChart>
    );

    const node = firstContainerRef.mock.calls[0]?.[0];
    expect(node).toBeInstanceOf(HTMLDivElement);

    rerender(
      <CustomChart horzScaleBehavior={{} as never} containerRef={secondContainerRef}>
        <div>Child</div>
      </CustomChart>
    );

    expect(firstContainerRef).toHaveBeenLastCalledWith(null);
    expect(secondContainerRef).toHaveBeenCalledWith(node);
  });

  it("hides CustomChart containers from the accessibility tree by default", () => {
    const { container } = render(
      <CustomChart horzScaleBehavior={{} as never}>
        <div>Child</div>
      </CustomChart>
    );

    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("allows overriding CustomChart container accessibility props", () => {
    const { container } = render(
      <CustomChart
        horzScaleBehavior={{} as never}
        containerProps={{ "aria-hidden": false, "aria-label": "Custom chart" }}
      >
        <div>Child</div>
      </CustomChart>
    );

    expect(container.firstChild).toHaveAttribute("aria-hidden", "false");
    expect(container.firstChild).toHaveAttribute("aria-label", "Custom chart");
  });
});
