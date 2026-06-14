import { beforeEach, describe, expect, it } from "vitest";
import {
  usePriceLinesControlsStore,
  usePriceLinesStore,
} from "@/samples/PriceLines/priceLinesStore";

const getLineTitles = () =>
  usePriceLinesStore
    .getState()
    .priceLines.map(priceLine => priceLine.options?.title ?? "");

describe("priceLinesStore", () => {
  beforeEach(() => {
    usePriceLinesControlsStore.setState({
      maxPriceVisible: true,
      minPriceVisible: true,
      avgPriceVisible: true,
    });
  });

  it("starts with all derived price lines visible", () => {
    expect(getLineTitles()).toEqual(["Max Price", "Min Price", "Average Price"]);
  });

  it("recomputes derived price lines when visibility toggles change", () => {
    usePriceLinesControlsStore.getState().setMaxPriceVisible(false);
    expect(getLineTitles()).toEqual(["Min Price", "Average Price"]);

    usePriceLinesControlsStore.getState().setAvgPriceVisible(false);
    expect(getLineTitles()).toEqual(["Min Price"]);

    usePriceLinesControlsStore.getState().setMinPriceVisible(false);
    expect(usePriceLinesStore.getState().priceLines).toEqual([]);
  });
});
