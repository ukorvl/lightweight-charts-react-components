import { FormControlLabel, FormGroup, Switch } from "@mui/material";
import { colors } from "@/colors";
import { chartCommonOptions } from "@/common/chartCommonOptions";
import { samplesLinks } from "@/samples";
import { ChartWidgetCard } from "@/ui/ChartWidgetCard";
import {
  CandlestickSeries,
  Chart,
  Markers,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import { seriesData, useMarkersStore } from "./markersStore";

const MarkersSample = () => {
  const { getMarkersData, basicMarkersVisible, setBasicMarkersVisible } =
    useMarkersStore();

  return (
    <ChartWidgetCard
      title="Markers"
      subTitle="Various markers display on the chart"
      sampleConfig={samplesLinks.Markers}
    >
      <FormGroup sx={{ marginBottom: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={basicMarkersVisible}
              onChange={() => setBasicMarkersVisible(!basicMarkersVisible)}
              slotProps={{ input: { "aria-label": "controlled" } }}
            />
          }
          label="Basic markers"
        />
      </FormGroup>
      <Chart options={chartCommonOptions} containerProps={{ style: { flexGrow: "1" } }}>
        <CandlestickSeries
          data={seriesData}
          options={{
            priceLineVisible: false,
            upColor: "transparent",
            downColor: colors.blue,
            borderUpColor: colors.blue,
            borderDownColor: colors.blue,
            wickUpColor: colors.blue,
            wickDownColor: colors.blue,
          }}
        >
          <Markers markers={getMarkersData()} />
        </CandlestickSeries>
        <TimeScale>
          <TimeScaleFitContentTrigger deps={[]} />
        </TimeScale>
      </Chart>
    </ChartWidgetCard>
  );
};

export { MarkersSample as Markers };
