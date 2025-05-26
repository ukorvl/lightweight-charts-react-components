import { LineSeries } from "lightweight-charts";
import type { ExtendedChartApi } from "./types";
import type { IChartApi } from "lightweight-charts";

const createChartWrapper = (chart: IChartApi): ExtendedChartApi => {
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

  return Object.assign(chart, {
    addPane,
  });
};

export { createChartWrapper };
