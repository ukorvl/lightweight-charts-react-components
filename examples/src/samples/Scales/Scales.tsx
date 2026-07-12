import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import { colors } from "@/common/colors";
import { samplesLinks } from "@/samples";
import { ScrollableContainer } from "@/ui/ScrollableContainer";
import {
  CandlestickSeries,
  Chart,
  HistogramSeries,
  LineSeries,
  Pane,
  PriceScale,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import {
  createPriceFormatter,
  currencySelectOptions,
  getScalesChartOptions,
  priceScalePositionSelectOptions,
  priceScaleTypeSelectOptions,
  priceScalesNumberSelectOptions,
  samePaneCandlestickData,
  samePaneVolumeData,
  samePaneVolumeScaleId,
  samePaneVolumeScaleOptions,
  secondSeriesData,
  usePriceCurrencyStore,
  usePriceScaleOptionsStore,
  usePriceScalePositionStore,
  usePriceScaleTypeStore,
  usePriceScalesNumberStore,
  type PriceScalePosition,
} from "./scalesStore";
import { ChartWidgetCard } from "../../ui/ChartWidgetCard";
import type { DeepPartial, PriceScaleOptions } from "lightweight-charts";

type SelectFormFieldProps<T extends string | number> = {
  label: string;
  value: T;
  setValue: (value: T) => void;
  options: readonly { value: T; label: string }[];
  disabled?: boolean;
};

const SelectFormField = <T extends string | number>({
  label,
  value,
  setValue,
  options,
  disabled,
}: SelectFormFieldProps<T>) => {
  return (
    <FormControl sx={{ minWidth: 120 }}>
      <FormHelperText>{label}</FormHelperText>
      <Select
        inputProps={{ "aria-label": label }}
        value={value}
        onChange={({ target }) => setValue(target.value as T)}
        size="small"
        disabled={disabled}
        variant="outlined"
      >
        {options.map(({ value: itemValue, label: itemLabel }) => (
          <MenuItem key={itemLabel} value={itemValue}>
            {itemLabel}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

type ScalesChartProps = {
  chartOptions: ReturnType<typeof getScalesChartOptions>;
  priceScaleOptions: DeepPartial<PriceScaleOptions>;
  priceScalePosition: PriceScalePosition;
  priceScalesNumber: number;
  showSamePaneVolume: boolean;
};

const ScalesChart = ({
  chartOptions,
  priceScaleOptions,
  priceScalePosition,
  priceScalesNumber,
  showSamePaneVolume,
}: ScalesChartProps) => {
  const secondaryPriceScalePosition = priceScalePosition === "left" ? "right" : "left";

  return (
    <Chart options={chartOptions} containerProps={{ style: { flexGrow: "1" } }}>
      <Pane>
        <CandlestickSeries
          data={samePaneCandlestickData}
          options={{
            upColor: "transparent",
            downColor: colors.orange100,
            borderUpColor: colors.blue,
            borderDownColor: colors.orange100,
            wickUpColor: colors.blue,
            wickDownColor: colors.orange100,
            priceLineVisible: false,
            priceScaleId: priceScalePosition,
          }}
        >
          <PriceScale id={priceScalePosition} options={priceScaleOptions} />
        </CandlestickSeries>
        {priceScalesNumber === 2 && (
          <LineSeries
            data={secondSeriesData}
            options={{
              color: colors.violet,
              lineWidth: 2,
              lastValueVisible: false,
              priceLineVisible: false,
              priceScaleId: secondaryPriceScalePosition,
            }}
          >
            <PriceScale id={secondaryPriceScalePosition} options={priceScaleOptions} />
          </LineSeries>
        )}
        {showSamePaneVolume && (
          <HistogramSeries
            data={samePaneVolumeData}
            options={{
              priceScaleId: samePaneVolumeScaleId,
              priceFormat: { type: "volume" },
              priceLineVisible: false,
              lastValueVisible: false,
            }}
          >
            <PriceScale id={samePaneVolumeScaleId} options={samePaneVolumeScaleOptions} />
          </HistogramSeries>
        )}
      </Pane>
      <TimeScale>
        <TimeScaleFitContentTrigger deps={[]} />
      </TimeScale>
    </Chart>
  );
};

const Scales = () => {
  const [showSamePaneVolume, setShowSamePaneVolume] = useState(true);
  const { priceScaleType, setPriceScaleType } = usePriceScaleTypeStore();
  const { priceScalesNumber, setPriceScalesNumber } = usePriceScalesNumberStore();
  const { priceScalePosition, setPriceScalePosition } = usePriceScalePositionStore();
  const { priceScaleOptions } = usePriceScaleOptionsStore();
  const { currency, setCurrency } = usePriceCurrencyStore();
  const priceFormatter = useMemo(() => {
    if (priceScaleType === "logarithmic" || priceScaleType === "percentage") {
      return undefined;
    }

    return createPriceFormatter(currency);
  }, [currency, priceScaleType]);

  const chartOptions = useMemo(() => {
    return getScalesChartOptions({
      priceFormatter,
      priceScalePosition,
      priceScalesNumber,
    });
  }, [priceFormatter, priceScalePosition, priceScalesNumber]);

  return (
    <ChartWidgetCard
      title="Scales"
      subTitle="Default scales with optional same-pane volume overlay"
      sampleConfig={samplesLinks.Scales}
    >
      <Stack height="100%" minHeight={0} spacing={2}>
        <ScrollableContainer sx={{ marginBottom: 1, flexShrink: 0 }}>
          <SelectFormField
            label="Price scales"
            value={priceScalesNumber}
            setValue={v => setPriceScalesNumber(Number(v))}
            options={priceScalesNumberSelectOptions}
          />
          <SelectFormField
            label="Price scale type"
            value={priceScaleType}
            setValue={setPriceScaleType}
            options={priceScaleTypeSelectOptions}
          />
          <SelectFormField
            label="Price scale position"
            value={priceScalePosition}
            setValue={setPriceScalePosition}
            options={priceScalePositionSelectOptions}
          />
          <SelectFormField
            label="Price formatter"
            value={currency}
            setValue={setCurrency}
            options={currencySelectOptions}
            disabled={priceScaleType === "logarithmic" || priceScaleType === "percentage"}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={showSamePaneVolume}
                onChange={event => setShowSamePaneVolume(event.target.checked)}
                slotProps={{
                  input: { "aria-label": "Display volume on same pane" },
                }}
              />
            }
            label="Display volume on same pane"
            sx={{ marginInlineStart: 0.5, whiteSpace: "nowrap" }}
          />
        </ScrollableContainer>
        <Typography color="text.secondary" variant="body2">
          {showSamePaneVolume
            ? priceScalesNumber === 2
              ? 'Candlesticks stay on the selected default scale, the comparison line uses the opposite default scale, and volume uses a custom overlay scale with id "whatever" in the same pane.'
              : 'Candlesticks stay on the selected default scale while volume uses a custom overlay scale with id "whatever" in the same pane.'
            : "Compare one or two default left and right price scales, then enable the volume overlay to add a custom same-pane scale."}
        </Typography>
        <Stack flexGrow={1} minHeight={0}>
          <ScalesChart
            chartOptions={chartOptions}
            priceScaleOptions={priceScaleOptions}
            priceScalePosition={priceScalePosition}
            priceScalesNumber={priceScalesNumber}
            showSamePaneVolume={showSamePaneVolume}
          />
        </Stack>
      </Stack>
    </ChartWidgetCard>
  );
};

export { Scales };
