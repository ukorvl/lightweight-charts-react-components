import { createChart, LineSeries } from "lightweight-charts";
import type { ExtendedChartApi } from "./types";
import type { ChartOptions, DeepPartial, IChartApi } from "lightweight-charts";

const createChartWrapper = (
  container: string | HTMLElement,
  options?: DeepPartial<ChartOptions>
): ExtendedChartApi => {
  const chart: IChartApi = createChart(container, options);

  const addPane = (paneIndex: number) => {
    chart.addSeries(
      LineSeries,
      {
        lineVisible: false,
        crosshairMarkerVisible: false,
        pointMarkersVisible: false,
      },
      paneIndex
    );

    const pane = chart.panes()[paneIndex];

    return pane;
  };

  const removePane = (paneIndex: number) => {
    //const pane = chart.panes()[paneIndex];

    chart.removePane(paneIndex);
  };

  const newChart = Object.create(chart) as ExtendedChartApi;
  newChart.addPane = addPane;
  newChart.removePane = removePane;

  return newChart;
};

export { createChartWrapper };
