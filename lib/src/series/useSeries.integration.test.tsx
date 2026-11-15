import "vitest-canvas-mock";
import { render } from "@testing-library/react";
import { createRef } from "react";
import React from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { Chart, OptionsChart } from "@/chart";
import { LineSeries } from "./LineSeries";
import type { SeriesApiRef } from "./types";
import type { ISeriesApi, LineData, Time, UTCTimestamp } from "lightweight-charts";

// Renders a real lightweight-charts instance: unlike the mocked unit tests, its `data()` returns
// new objects on every call, so reactive diffing must not depend on native data references.

const chartOptions = { width: 400, height: 300 };
const startTime = 1_700_000_000;

const createPoint = (index: number, value = index): LineData<Time> => ({
  time: (startTime + index * 60) as UTCTimestamp,
  value,
});

const createData = (length: number) =>
  Array.from({ length }, (_, index) => createPoint(index));

const renderSeries = (data: LineData<Time>[], alwaysReplaceData?: boolean) => {
  const seriesRef = createRef<SeriesApiRef<"Line">>();
  const renderChart = (nextData: LineData<Time>[]) => (
    <Chart options={chartOptions}>
      <LineSeries ref={seriesRef} data={nextData} alwaysReplaceData={alwaysReplaceData} />
    </Chart>
  );
  const { rerender } = render(renderChart(data));

  return {
    ...spySeries(seriesRef.current!.api()!),
    rerender: (nextData: LineData<Time>[]) => rerender(renderChart(nextData)),
  };
};

const spySeries = <HorzScaleItem,>(seriesApi: ISeriesApi<"Line", HorzScaleItem>) => {
  const spies = {
    update: vi.spyOn(seriesApi, "update"),
    setData: vi.spyOn(seriesApi, "setData"),
    data: vi.spyOn(seriesApi, "data"),
  };

  return {
    spies,
    // Reads the native data without counting as a call made by the wrapper.
    nativeValues: () => {
      spies.data.mockClear();
      const values = seriesApi
        .data()
        .map(point => (point as LineData<HorzScaleItem>).value);
      spies.data.mockClear();
      return values;
    },
  };
};

describe("Series reactive data with a real chart", () => {
  beforeAll(() => {
    // jsdom has no matchMedia, which lightweight-charts uses to watch the device pixel ratio
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    });
  });

  it("uses update() to append a point without reading native data", () => {
    const data = createData(1000);
    const series = renderSeries(data);
    const nextPoint = createPoint(1000, 42);

    series.rerender([...data, nextPoint]);

    expect(series.spies.update).toHaveBeenCalledTimes(1);
    expect(series.spies.update).toHaveBeenCalledWith(expect.objectContaining(nextPoint));
    expect(series.spies.setData).not.toHaveBeenCalled();
    expect(series.spies.data).not.toHaveBeenCalled();
    expect(series.nativeValues()).toHaveLength(1001);
    expect(series.nativeValues().at(-1)).toBe(42);
  });

  it("uses update() to replace the last point with the same time", () => {
    const data = createData(1000);
    const series = renderSeries(data);
    const replacedPoint = createPoint(999, 42);

    series.rerender([...data.slice(0, -1), replacedPoint]);

    expect(series.spies.update).toHaveBeenCalledTimes(1);
    expect(series.spies.update).toHaveBeenCalledWith(
      expect.objectContaining(replacedPoint)
    );
    expect(series.spies.setData).not.toHaveBeenCalled();
    expect(series.spies.data).not.toHaveBeenCalled();
    expect(series.nativeValues()).toHaveLength(1000);
    expect(series.nativeValues().at(-1)).toBe(42);
  });

  it.each([
    [
      "a historical point is edited",
      (data: LineData<Time>[]) => data.with(10, createPoint(10, 42)),
    ],
    ["the data is truncated", (data: LineData<Time>[]) => data.slice(0, 500)],
    ["a point is prepended", (data: LineData<Time>[]) => [createPoint(-1), ...data]],
    [
      "more than one point is appended",
      (data: LineData<Time>[]) => [...data, createPoint(1000), createPoint(1001)],
    ],
    [
      "the data is rebuilt from new objects",
      (data: LineData<Time>[]) => data.map(point => ({ ...point })),
    ],
  ])("uses setData() when %s", (_label, getNextData) => {
    const data = createData(1000);
    const series = renderSeries(data);
    const nextData = getNextData(data);

    series.rerender(nextData);

    expect(series.spies.setData).toHaveBeenCalledTimes(1);
    expect(series.spies.setData).toHaveBeenCalledWith(nextData);
    expect(series.spies.update).not.toHaveBeenCalled();
    expect(series.nativeValues()).toEqual(nextData.map(point => point.value));
  });

  it("uses update() for consecutive ticks with yyyy-mm-dd string times", () => {
    const createDayPoint = (day: number, value = day): LineData<Time> => ({
      time: `2023-01-${String(day).padStart(2, "0")}`,
      value,
    });
    const data = Array.from({ length: 20 }, (_, index) => createDayPoint(index + 1));
    const series = renderSeries(data);
    const firstTick = [...data.slice(0, -1), createDayPoint(20, 42)];
    const secondTick = [...data.slice(0, -1), createDayPoint(20, 43)];
    const thirdTick = [...secondTick, createDayPoint(21, 44)];

    series.rerender(firstTick);
    series.rerender(secondTick);
    series.rerender(thirdTick);

    expect(series.spies.update).toHaveBeenCalledTimes(3);
    expect(series.spies.setData).not.toHaveBeenCalled();
    expect(series.nativeValues()).toHaveLength(21);
    expect(series.nativeValues().slice(-2)).toEqual([43, 44]);
    // update() would convert the string time of the point it receives into a BusinessDay.
    expect(thirdTick[20].time).toBe("2023-01-21");
  });

  it("does not write into data points passed to update()", () => {
    const data = createData(10);
    const series = renderSeries(data);
    // Frozen like Immer or Redux Toolkit state: update() stores the original time on its input.
    const replacedPoint = Object.freeze(createPoint(9, 42));
    const appendedPoint = Object.freeze(createPoint(10, 43));

    series.rerender([...data.slice(0, -1), replacedPoint]);
    series.rerender([...data.slice(0, -1), replacedPoint, appendedPoint]);

    expect(series.spies.update).toHaveBeenCalledTimes(2);
    expect(series.spies.setData).not.toHaveBeenCalled();
    expect(Object.keys(appendedPoint)).toEqual(["time", "value"]);
    expect(series.nativeValues().slice(-2)).toEqual([42, 43]);
  });

  it("plots an appended point that reads its value from a prototype getter", () => {
    class PointWithGetter {
      constructor(
        public time: Time,
        private readonly rawValue: number
      ) {}

      get value() {
        return this.rawValue;
      }
    }

    const data = createData(10);
    const series = renderSeries(data);
    const appendedPoint = new PointWithGetter(createPoint(10).time, 42);

    series.rerender([...data, appendedPoint]);

    expect(series.spies.setData).toHaveBeenCalledTimes(1);
    expect(series.spies.update).not.toHaveBeenCalled();
    expect(series.nativeValues().at(-1)).toBe(42);
  });

  it("picks up points changed in place when alwaysReplaceData is set", () => {
    const data = [createPoint(0, 10), createPoint(1, 20)];
    const series = renderSeries(data, true);

    data[0].value = 11;
    series.rerender([...data, createPoint(2, 30)]);

    expect(series.nativeValues()).toEqual([11, 20, 30]);
  });

  it("uses update() on a price-based horizontal scale", () => {
    const seriesRef = createRef<SeriesApiRef<"Line", number>>();
    const data = [
      { time: 95, value: 1.2 },
      { time: 100, value: 2.8 },
    ];
    const renderOptionsChart = (nextData: LineData<number>[]) => (
      <OptionsChart options={chartOptions}>
        <LineSeries ref={seriesRef} data={nextData} />
      </OptionsChart>
    );
    const { rerender } = render(renderOptionsChart(data));
    const series = spySeries(seriesRef.current!.api()!);
    const replacedData = [data[0], { time: 100, value: 3.1 }];

    rerender(renderOptionsChart(replacedData));
    rerender(renderOptionsChart([...replacedData, { time: 105, value: 4.2 }]));

    expect(series.spies.update).toHaveBeenCalledTimes(2);
    expect(series.spies.setData).not.toHaveBeenCalled();
    expect(series.nativeValues()).toEqual([1.2, 3.1, 4.2]);
  });

  it("uses setData() to append a point when alwaysReplaceData is set", () => {
    const data = createData(1000);
    const series = renderSeries(data, true);
    const nextData = [...data, createPoint(1000)];

    series.rerender(nextData);

    expect(series.spies.setData).toHaveBeenCalledTimes(1);
    expect(series.spies.update).not.toHaveBeenCalled();
    expect(series.nativeValues()).toHaveLength(1001);
  });
});
