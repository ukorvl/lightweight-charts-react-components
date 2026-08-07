import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useRealTimeSampleStore } from "@/samples/RealTime/realTimeDataStore";
import type { CandlestickData } from "lightweight-charts";

const createCandle = (
  day: number,
  overrides: Partial<CandlestickData<string>> = {}
): CandlestickData<string> => ({
  time: `2024-01-${String(day).padStart(2, "0")}`,
  open: 10,
  high: 11,
  low: 9,
  close: 10,
  ...overrides,
});

describe("realTimeDataStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useRealTimeSampleStore.getState().stopSimulation();
    useRealTimeSampleStore.setState({
      reactive: true,
      resizeOnUpdate: false,
      data: [createCandle(1)],
    });
  });

  afterEach(() => {
    useRealTimeSampleStore.getState().stopSimulation();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("appends one simulated candle per tick and ignores duplicate starts", async () => {
    vi.spyOn(Math, "random").mockReturnValueOnce(0.5).mockReturnValueOnce(0.9);

    useRealTimeSampleStore.getState().startSimulation();
    useRealTimeSampleStore.getState().startSimulation();

    await vi.advanceTimersByTimeAsync(1000);

    const data = useRealTimeSampleStore.getState().data;
    expect(data).toHaveLength(2);
    expect(data[1]).toEqual({
      time: "2024-01-02",
      open: 10,
      high: 12.25,
      low: 9.25,
      close: 11.5,
    });
  });

  it("updates the reactive flags and data through the exposed setters", () => {
    const replacementData = [createCandle(3, { close: 12 })];

    useRealTimeSampleStore.getState().setReactive(false);
    useRealTimeSampleStore.getState().setResizeOnUpdate(true);
    useRealTimeSampleStore.getState().setData(replacementData);

    expect(useRealTimeSampleStore.getState()).toMatchObject({
      reactive: false,
      resizeOnUpdate: true,
      data: replacementData,
    });
  });

  it("creates a downward candle and clamps the low when it would fall below the minimum threshold", async () => {
    vi.spyOn(Math, "random").mockReturnValueOnce(0.4).mockReturnValueOnce(0.1);
    useRealTimeSampleStore.setState({
      data: [createCandle(1, { open: 5, high: 5.5, low: 5, close: 5 })],
    });

    useRealTimeSampleStore.getState().startSimulation();
    await vi.advanceTimersByTimeAsync(1000);

    expect(useRealTimeSampleStore.getState().data[1]).toEqual({
      time: "2024-01-02",
      open: 5,
      high: 5.6,
      low: 5,
      close: 3.8,
    });
  });

  it("caps simulated data at 300 points and stops updating after stopSimulation", async () => {
    vi.spyOn(Math, "random").mockReturnValueOnce(0.5).mockReturnValueOnce(0.9);

    const initialData = Array.from({ length: 300 }, (_, index) =>
      createCandle(index + 1)
    );
    useRealTimeSampleStore.setState({
      data: initialData,
    });

    useRealTimeSampleStore.getState().startSimulation();
    await vi.advanceTimersByTimeAsync(1000);

    const afterFirstTick = useRealTimeSampleStore.getState().data;
    expect(afterFirstTick).toHaveLength(300);
    expect(afterFirstTick[0].time).toBe("2024-01-02");

    useRealTimeSampleStore.getState().stopSimulation();
    await vi.advanceTimersByTimeAsync(2000);

    expect(useRealTimeSampleStore.getState().data).toEqual(afterFirstTick);
  });

  it("does not clear timers when stopSimulation is called without an active interval", () => {
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");

    useRealTimeSampleStore.getState().stopSimulation();

    expect(clearIntervalSpy).not.toHaveBeenCalled();
    expect(useRealTimeSampleStore.getState().data).toEqual([createCandle(1)]);
  });
});
