import { beforeEach, describe, expect, it } from "vitest";
import {
  dataRangeMap,
  useDataRangeStore,
  useSeriesDataStore,
} from "@/samples/RangeSwitcher/rangeSwitcherStore";

describe("rangeSwitcherStore", () => {
  beforeEach(() => {
    useDataRangeStore.setState({
      range: "1d",
    });
    useSeriesDataStore.setState({
      data: dataRangeMap["1d"].data,
    });
  });

  it("updates the shared series data when the selected range changes", () => {
    useDataRangeStore.getState().setRange("1w");

    expect(useDataRangeStore.getState().range).toBe("1w");
    expect(useSeriesDataStore.getState().data).toBe(dataRangeMap["1w"].data);

    useDataRangeStore.getState().setRange("1y");

    expect(useSeriesDataStore.getState().data).toBe(dataRangeMap["1y"].data);
  });

  it("keeps precomputed datasets aligned with their formatter map", () => {
    expect(dataRangeMap["1d"].data).toHaveLength(50);
    expect(dataRangeMap["1w"].data).toHaveLength(50);
    expect(dataRangeMap["1m"].data).toHaveLength(50);
    expect(dataRangeMap["1y"].data).toHaveLength(50);
  });
});
