import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { useOnScreen } from "@ukorvl/react-on-screen";
import { useEffect, useRef } from "react";
import { chartCommonOptions } from "@/common/chartCommonOptions";
import { samplesLinks } from "@/samples";
import { ChartWidgetCard } from "@/ui/ChartWidgetCard";
import {
  CandlestickSeries,
  Chart,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import { useRealTimeSampleStore } from "./realTimeDataStore";
import type { RefObject } from "react";

const RealTime = () => {
  const {
    reactive,
    setReactive,
    resizeOnUpdate,
    setResizeOnUpdate,
    data,
    startSimulation,
    stopSimulation,
  } = useRealTimeSampleStore();
  const ref = useRef<HTMLDivElement>(null);
  const { isOnScreen } = useOnScreen<HTMLDivElement>({
    ref: ref as RefObject<HTMLDivElement>,
    margin: "100px",
  });

  useEffect(() => {
    if (isOnScreen) {
      startSimulation();
    } else {
      stopSimulation();
    }

    return () => {
      stopSimulation();
    };
  }, [isOnScreen, startSimulation, stopSimulation]);

  return (
    <ChartWidgetCard
      title="Realtime updates"
      subTitle="Updating the chart in real-time"
      sampleConfig={samplesLinks.RealTime}
    >
      <FormGroup sx={{ flexDirection: "row", gap: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={reactive}
              onChange={e => setReactive(e.target.checked)}
              slotProps={{ input: { "aria-label": "controlled" } }}
            />
          }
          label="Reactive"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={resizeOnUpdate}
              onChange={e => setResizeOnUpdate(e.target.checked)}
              slotProps={{ input: { "aria-label": "controlled" } }}
            />
          }
          label="Resize on update"
        />
      </FormGroup>
      <Chart
        containerProps={{ style: { flexGrow: "1" } }}
        options={chartCommonOptions}
        ref={ref}
      >
        <CandlestickSeries data={data} reactive={reactive} />
        <TimeScale>
          <TimeScaleFitContentTrigger deps={resizeOnUpdate ? [data.length] : []} />
        </TimeScale>
      </Chart>
    </ChartWidgetCard>
  );
};

export { RealTime };
