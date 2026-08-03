import Typography from "@mui/material/Typography";
import { useCallback, useRef, useState } from "react";
import { withChartCommonOptions } from "@/common/chartCommonOptions";
import { colors } from "@/common/colors";
import { samplesLinks } from "@/samples";
import { ChartWidgetCard } from "@/ui/ChartWidgetCard";
import {
  CandlestickSeries,
  Chart,
  HistogramSeries,
  LineSeries,
  Pane,
  PriceLine,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import { focusPane, restorePanes, type PaneLayoutSnapshot } from "./paneFocus";
import { ohlcData, rsiData, volumeData } from "../Panes/panesData";
import type { IChartApi, MouseEventParams } from "lightweight-charts";

type PaneId = 0 | 1 | 2;

const isPaneId = (paneIndex: number | undefined): paneIndex is PaneId =>
  paneIndex === 0 || paneIndex === 1 || paneIndex === 2;

const PricePane = () => (
  <>
    <CandlestickSeries
      data={ohlcData}
      options={{
        upColor: "transparent",
        downColor: colors.orange100,
        borderUpColor: colors.blue,
        borderDownColor: colors.orange100,
        wickUpColor: colors.blue,
        wickDownColor: colors.orange100,
        priceLineVisible: false,
      }}
    />
  </>
);

const RsiPane = () => (
  <>
    <LineSeries
      data={rsiData}
      options={{
        priceLineVisible: false,
        color: colors.blue100,
        lineWidth: 2,
        priceScaleId: "right",
      }}
    >
      <PriceLine
        price={70}
        options={{
          color: colors.violet,
          lineWidth: 1,
          lineStyle: 3,
          axisLabelVisible: true,
        }}
      />
      <PriceLine
        price={30}
        options={{
          color: colors.violet,
          lineWidth: 1,
          lineStyle: 3,
          axisLabelVisible: true,
        }}
      />
    </LineSeries>
  </>
);

const VolumePane = () => (
  <>
    <HistogramSeries
      data={volumeData}
      options={{
        priceLineVisible: false,
        priceFormat: {
          type: "volume",
        },
      }}
    />
  </>
);

const PanesDoubleClick = () => {
  const [focusedPane, setFocusedPane] = useState<PaneId | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const paneLayoutRef = useRef<PaneLayoutSnapshot | null>(null);

  const onDblClick = useCallback(
    (param: MouseEventParams) => {
      const chart = chartRef.current;
      if (!chart) {
        return;
      }

      if (focusedPane !== null) {
        if (paneLayoutRef.current) {
          restorePanes(chart, paneLayoutRef.current);
        }
        paneLayoutRef.current = null;
        setFocusedPane(null);
        return;
      }

      if (isPaneId(param.paneIndex)) {
        const paneLayout = focusPane(chart, param.paneIndex);
        if (paneLayout) {
          paneLayoutRef.current = paneLayout;
          setFocusedPane(param.paneIndex);
        }
      }
    },
    [focusedPane]
  );

  const helpText =
    focusedPane === null
      ? "Double-click any pane to make it the only visible pane."
      : "Double-click again to restore the full multi-pane layout.";

  return (
    <ChartWidgetCard
      title="Panes double click"
      subTitle="Focus any pane, then restore the full layout"
      sampleConfig={samplesLinks.PanesDoubleClick}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {helpText}
      </Typography>
      <Chart
        onDblClick={onDblClick}
        onInit={chart => {
          chartRef.current = chart;
        }}
        options={withChartCommonOptions({
          layout: {
            panes: {
              enableResize: true,
              separatorColor: colors.gray100,
            },
          },
        })}
        containerProps={{
          style: { flexGrow: "1" },
          id: "panes-double-click-chart",
        }}
      >
        <PricePane />
        <Pane stretchFactor={1}>
          <RsiPane />
        </Pane>
        <Pane stretchFactor={1}>
          <VolumePane />
        </Pane>
        <TimeScale>
          <TimeScaleFitContentTrigger deps={[]} />
        </TimeScale>
      </Chart>
    </ChartWidgetCard>
  );
};

export { PanesDoubleClick };
