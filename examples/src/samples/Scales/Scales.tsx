import FormControl from "@mui/material/FormControl";
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
  AreaSeries,
  CandlestickSeries,
  Chart,
  HistogramSeries,
  Pane,
  PriceScale,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import {
  createPriceFormatter,
  currencySelectOptions,
  getScalesChartOptions,
  mainSeriesData,
  priceScalePositionSelectOptions,
  priceScaleTypeSelectOptions,
  priceScalesNumberSelectOptions,
  samePaneCandlestickData,
  samePaneVolumeData,
  samePaneVolumeScaleId,
  samePaneVolumeScaleOptions,
  scaleExampleModeSelectOptions,
  secondSeriesData,
  usePriceCurrencyStore,
  usePriceScaleOptionsStore,
  usePriceScalePositionStore,
  usePriceScaleTypeStore,
  usePriceScalesNumberStore,
  type PriceScalePosition,
  type ScaleExampleMode,
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

type DefaultScalesChartProps = {
  chartOptions: ReturnType<typeof getScalesChartOptions>;
  priceScaleOptions: DeepPartial<PriceScaleOptions>;
  priceScalePosition: PriceScalePosition;
  priceScalesNumber: number;
};

const DefaultScalesChart = ({
  chartOptions,
  priceScaleOptions,
  priceScalePosition,
  priceScalesNumber,
}: DefaultScalesChartProps) => (
  <Chart options={chartOptions} containerProps={{ style: { flexGrow: "1" } }}>
    <Pane>
      <AreaSeries
        data={mainSeriesData}
        options={{
          lineColor: colors.red,
          topColor: colors.red,
          bottomColor: `${colors.red}33`,
          lineWidth: 2,
          priceScaleId: priceScalePosition,
        }}
      >
        <PriceScale id={priceScalePosition} options={priceScaleOptions} />
      </AreaSeries>
      {priceScalesNumber === 2 && (
        <AreaSeries
          data={secondSeriesData}
          options={{
            lineColor: colors.violet,
            topColor: colors.violet,
            bottomColor: `${colors.violet}33`,
            lineWidth: 2,
            priceScaleId: priceScalePosition === "left" ? "right" : "left",
          }}
        >
          <PriceScale
            id={priceScalePosition === "left" ? "right" : "left"}
            options={priceScaleOptions}
          />
        </AreaSeries>
      )}
    </Pane>
    <TimeScale>
      <TimeScaleFitContentTrigger deps={[]} />
    </TimeScale>
  </Chart>
);

type SinglePaneVolumeChartProps = {
  chartOptions: ReturnType<typeof getScalesChartOptions>;
  priceScaleOptions: DeepPartial<PriceScaleOptions>;
  priceScalePosition: PriceScalePosition;
};

const SinglePaneVolumeChart = ({
  chartOptions,
  priceScaleOptions,
  priceScalePosition,
}: SinglePaneVolumeChartProps) => (
  <Chart options={chartOptions} containerProps={{ style: { flexGrow: "1" } }}>
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
    <TimeScale>
      <TimeScaleFitContentTrigger deps={[]} />
    </TimeScale>
  </Chart>
);

const Scales = () => {
  const [exampleMode, setExampleMode] = useState<ScaleExampleMode>("default-scales");
  const { priceScaleType, setPriceScaleType } = usePriceScaleTypeStore();
  const { priceScalesNumber, setPriceScalesNumber } = usePriceScalesNumberStore();
  const { priceScalePosition, setPriceScalePosition } = usePriceScalePositionStore();
  const { priceScaleOptions } = usePriceScaleOptionsStore();
  const { currency, setCurrency } = usePriceCurrencyStore();
  const isSinglePaneVolumeMode = exampleMode === "single-pane-volume";
  const priceFormatter = useMemo(() => {
    if (priceScaleType === "logarithmic" || priceScaleType === "percentage") {
      return undefined;
    }

    return createPriceFormatter(currency);
  }, [currency, priceScaleType]);

  const chartOptions = useMemo(() => {
    return getScalesChartOptions({
      exampleMode,
      priceFormatter,
      priceScalePosition,
      priceScalesNumber,
    });
  }, [exampleMode, priceFormatter, priceScalePosition, priceScalesNumber]);

  return (
    <ChartWidgetCard
      title="Scales"
      subTitle="Default scales and custom same-pane scale behavior"
      sampleConfig={samplesLinks.Scales}
    >
      <Stack height="100%" minHeight={0} spacing={2}>
        <ScrollableContainer sx={{ marginBottom: 1, flexShrink: 0 }}>
          <SelectFormField
            label="Example"
            value={exampleMode}
            setValue={setExampleMode}
            options={scaleExampleModeSelectOptions}
          />
          <SelectFormField
            label="Price scales"
            value={priceScalesNumber}
            setValue={v => setPriceScalesNumber(Number(v))}
            options={priceScalesNumberSelectOptions}
            disabled={isSinglePaneVolumeMode}
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
            disabled={!isSinglePaneVolumeMode && priceScalesNumber === 2}
          />
          <SelectFormField
            label="Price formatter"
            value={currency}
            setValue={setCurrency}
            options={currencySelectOptions}
            disabled={priceScaleType === "logarithmic" || priceScaleType === "percentage"}
          />
        </ScrollableContainer>
        <Typography color="text.secondary" variant="body2">
          {isSinglePaneVolumeMode
            ? "Candlesticks stay on the selected default scale while volume uses a separate custom overlay scale in the same root pane."
            : "Compare one or two default left and right price scales while keeping the shared formatting controls the same."}
        </Typography>
        <Stack flexGrow={1} minHeight={0}>
          {isSinglePaneVolumeMode ? (
            <SinglePaneVolumeChart
              chartOptions={chartOptions}
              priceScaleOptions={priceScaleOptions}
              priceScalePosition={priceScalePosition}
            />
          ) : (
            <DefaultScalesChart
              chartOptions={chartOptions}
              priceScaleOptions={priceScaleOptions}
              priceScalePosition={priceScalePosition}
              priceScalesNumber={priceScalesNumber}
            />
          )}
        </Stack>
      </Stack>
    </ChartWidgetCard>
  );
};

export { Scales };
