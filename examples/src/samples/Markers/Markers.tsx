import { ChartWidgetCard } from "@/ui/ChartWidgetCard";
import { AreaSeries, Chart, Markers } from "lightweight-charts-react-components";
import { chartCommonOptions } from "@/common/chartCommonOptions";
import { samplesLinks } from "@/samples";
import { seriesData, useMarkersStore } from "./markersStore";
import { colors } from "@/colors";
import { FormControlLabel, FormGroup, Switch } from "@mui/material";

const MarkersSample = () => {
  const { getMarkersData, basicMarkersVisible, setBasicMarkersVisible } =
    useMarkersStore();

  return (
    <ChartWidgetCard
      title="Markers"
      subTitle="Various markers display on the chart"
      githubLink={samplesLinks.Markers.github}
    >
      <FormGroup>
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
        <AreaSeries
          data={seriesData}
          options={{
            topColor: colors.blue100,
            bottomColor: "transparent",
            lineColor: colors.blue100,
            priceLineVisible: false,
          }}
        >
          <Markers reactive markers={getMarkersData()} />
        </AreaSeries>
      </Chart>
    </ChartWidgetCard>
  );
};

export { MarkersSample as Markers };
