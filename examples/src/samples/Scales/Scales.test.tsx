import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { PriceScaleMode } from "lightweight-charts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Scales } from "./Scales";
import {
  usePriceCurrencyStore,
  usePriceScaleOptionsStore,
  usePriceScalePositionStore,
  usePriceScaleTypeStore,
  usePriceScalesNumberStore,
} from "./scalesStore";
import type { PropsWithChildren } from "react";

type SeriesMockProps = PropsWithChildren<{
  options?: {
    priceScaleId?: string;
  };
}>;

type PriceScaleMockProps = PropsWithChildren<{
  id: string;
}>;

vi.mock("lightweight-charts-react-components", async () => {
  const React = await import("react");

  const createSeriesMock = (testId: string) => {
    const SeriesMock = ({ children, options }: SeriesMockProps) =>
      React.createElement(
        "div",
        {
          "data-testid": testId,
          ...(options?.priceScaleId
            ? { "data-price-scale-id": options.priceScaleId }
            : {}),
        },
        children
      );
    SeriesMock.displayName = `${testId}-mock`;

    return SeriesMock;
  };

  const ChartMock = ({ children }: PropsWithChildren) =>
    React.createElement("div", { "data-testid": "chart" }, children);
  ChartMock.displayName = "ChartMock";

  const PaneMock = ({ children }: PropsWithChildren) =>
    React.createElement("div", { "data-testid": "pane" }, children);
  PaneMock.displayName = "PaneMock";

  const PriceScaleMock = ({ id, children }: PriceScaleMockProps) =>
    React.createElement(
      "div",
      { "data-testid": "price-scale", "data-scale-id": id },
      children
    );
  PriceScaleMock.displayName = "PriceScaleMock";

  const TimeScaleMock = ({ children }: PropsWithChildren) =>
    React.createElement("div", { "data-testid": "time-scale" }, children);
  TimeScaleMock.displayName = "TimeScaleMock";

  return {
    CandlestickSeries: createSeriesMock("candlestick-series"),
    Chart: ChartMock,
    HistogramSeries: createSeriesMock("histogram-series"),
    LineSeries: createSeriesMock("line-series"),
    Pane: PaneMock,
    PriceScale: PriceScaleMock,
    TimeScale: TimeScaleMock,
    TimeScaleFitContentTrigger: () => null,
  };
});

const getRenderedScaleIds = () =>
  screen
    .getAllByTestId("price-scale")
    .map(node => node.getAttribute("data-scale-id"))
    .sort();

describe("Scales", () => {
  beforeEach(() => {
    usePriceScalePositionStore.getState().setPriceScalePosition("right");
    usePriceScalesNumberStore.getState().setPriceScalesNumber(2);
    usePriceScaleTypeStore.getState().setPriceScaleType("normal");
    usePriceScaleOptionsStore.getState().setPriceScaleOptions({
      visible: true,
      mode: PriceScaleMode.Normal,
      invertScale: false,
    });
    usePriceCurrencyStore.getState().setCurrency("USD");
  });

  it("toggles the same-pane volume overlay without removing the default scales", () => {
    render(<Scales />);

    const checkbox = screen.getByRole("checkbox", {
      name: /display volume on same pane/i,
    });

    expect(checkbox).toBeChecked();
    expect(getRenderedScaleIds()).toEqual(["left", "right", "whatever"]);
    expect(
      screen.getByText(/comparison line uses the opposite default scale/i)
    ).toBeInTheDocument();

    fireEvent.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(getRenderedScaleIds()).toEqual(["left", "right"]);
    expect(
      screen.queryByText(/custom overlay scale with id "whatever"/i)
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/enable the volume overlay to add a custom same-pane scale/i)
    ).toBeInTheDocument();
  });
});
