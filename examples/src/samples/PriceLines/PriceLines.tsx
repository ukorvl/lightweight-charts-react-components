import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { colors } from "@/colors";
import { withChartCommonOptions } from "@/common/chartCommonOptions";
import { samplesLinks } from "@/samples";
import { ScrollableContainer } from "@/ui/ScrollableContainer";
import {
  CandlestickSeries,
  Chart,
  PriceLine,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import {
  seriesData,
  usePriceLinesControlsStore,
  usePriceLinesStore,
} from "./priceLinesStore";
import { ChartWidgetCard } from "../../ui/ChartWidgetCard";

const PriceLines = () => {
  const {
    maxPriceVisible,
    minPriceVisible,
    avgPriceVisible,
    setAvgPriceVisible,
    setMaxPriceVisible,
    setMinPriceVisible,
  } = usePriceLinesControlsStore();
  const { priceLines } = usePriceLinesStore();

  return (
    <ChartWidgetCard
      title="PriceLines"
      subTitle="Multiple price lines with titles"
      sampleConfig={samplesLinks.PriceLines}
    >
      <ScrollableContainer sx={{ marginBottom: 2 }}>
        <FormGroup sx={{ flexDirection: "row", gap: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={maxPriceVisible}
                onChange={e => setMaxPriceVisible(e.target.checked)}
                slotProps={{ input: { "aria-label": "controlled" } }}
              />
            }
            label="Max price"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={avgPriceVisible}
                onChange={e => setAvgPriceVisible(e.target.checked)}
                slotProps={{ input: { "aria-label": "controlled" } }}
              />
            }
            label="Avg price"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={minPriceVisible}
                onChange={e => setMinPriceVisible(e.target.checked)}
                slotProps={{ input: { "aria-label": "controlled" } }}
              />
            }
            label="Min price"
          />
        </FormGroup>
      </ScrollableContainer>
      <Chart
        options={withChartCommonOptions({
          timeScale: {
            fixRightEdge: true,
            fixLeftEdge: true,
          },
        })}
        containerProps={{ style: { flexGrow: "1" } }}
      >
        <TimeScale>
          <TimeScaleFitContentTrigger deps={[]} />
        </TimeScale>
        <CandlestickSeries
          data={seriesData}
          options={{
            upColor: "transparent",
            downColor: colors.blue,
            borderUpColor: colors.blue,
            borderDownColor: colors.blue,
            wickUpColor: colors.blue,
            wickDownColor: colors.blue,
            priceLineVisible: false,
          }}
        >
          {priceLines.map(({ price, options }) => (
            <PriceLine
              key={`${options?.title}-${price}`}
              options={options}
              price={price}
            />
          ))}
        </CandlestickSeries>
      </Chart>
    </ChartWidgetCard>
  );
};

export { PriceLines };
