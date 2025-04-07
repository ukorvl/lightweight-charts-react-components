import { FormControlLabel, FormGroup, Switch } from "@mui/material";
import { CandlestickSeries, Chart, Markers } from "lightweight-charts-react-components";
import { colors } from "@/colors";
import { chartCommonOptions } from "@/common/chartCommonOptions";
import { samplesLinks } from "@/samples";
import { ChartWidgetCard } from "@/ui/ChartWidgetCard";
import { seriesData, useMarkersStore } from "./markersStore";

const MarkersSample = () => {
  const { getMarkersData, basicMarkersVisible, setBasicMarkersVisible } =
    useMarkersStore();

  return (
    <ChartWidgetCard
      title="Markers"
      subTitle="Various markers display on the chart"
      githubLink={samplesLinks.Markers.github}
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
      <Chart height={400} {...chartCommonOptions} autoSize>
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
      </Chart>
    </ChartWidgetCard>
  );
};

export { MarkersSample as Markers };
