import { render } from "@testing-library/react";
import React from "react";
import { beforeEach } from "vitest";
import { describe, expect, it, vi } from "vitest";
import { AreaSeries } from "./AreaSeries";
import { BarSeries } from "./BarSeries";
import { BaselineSeries } from "./BaselineSeries";
import { CandlestickSeries } from "./CandlestickSeries";
import { CustomSeries } from "./CustomSeries";
import { HistogramSeries } from "./HistogramSeries";
import { LineSeries } from "./LineSeries";

const mockSeriesTemplate = vi.fn(({ _props }) => <div>Mocked Series Template</div>);

vi.mock("./SeriesTemplate", () => ({
  SeriesTemplate: vi.fn(({ ...props }) => mockSeriesTemplate({ ...props })),
}));

const seriesTypesMap = {
  LineSeries: LineSeries,
  HistogramSeries: HistogramSeries,
  AreaSeries: AreaSeries,
  BarSeries: BarSeries,
  CandlestickSeries: CandlestickSeries,
  BaselineSeries: BaselineSeries,
  CustomSeries: CustomSeries,
} as const;

Object.keys(seriesTypesMap).forEach(seriesComponentName => {
  const SeriesComponent =
    seriesTypesMap[seriesComponentName as keyof typeof seriesTypesMap];

  describe(`${seriesComponentName} Series`, () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should have correct display name", () => {
      expect(SeriesComponent.displayName).toBe(seriesComponentName);
    });

    it(`should render ${seriesComponentName} series`, () => {
      render(<SeriesComponent data={[]}></SeriesComponent>);
      const type = seriesComponentName.replace("Series", "");

      expect(mockSeriesTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: [],
          type,
        })
      );
    });
  });
});
