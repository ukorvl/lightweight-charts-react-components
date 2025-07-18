import { FormControl, FormHelperText, MenuItem, Select } from "@mui/material";
import { useMemo } from "react";
import { colors } from "@/colors";
import { withChartCommonOptions } from "@/common/chartCommonOptions";
import { samplesLinks } from "@/samples";
import { ScrollableContainer } from "@/ui/ScrollableContainer";
import {
  AreaSeries,
  Chart,
  Pane,
  PriceScale,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import {
  currencySelectOptions,
  mainSeriesData,
  priceScalePositionSelectOptions,
  priceScaleTypeSelectOptions,
  priceScalesNumberSelectOptions,
  secondSeriesData,
  useChartLocalizationOptionsStore,
  usePriceCurrencyStore,
  usePriceScaleOptionsStore,
  usePriceScalePositionStore,
  usePriceScaleTypeStore,
  usePriceScalesNumberStore,
} from "./scalesStore";
import { ChartWidgetCard } from "../../ui/ChartWidgetCard";
import type { ChartOptions, DeepPartial } from "lightweight-charts";

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

const Scales = () => {
  const { priceScaleType, setPriceScaleType } = usePriceScaleTypeStore();
  const { priceScalesNumber, setPriceScalesNumber } = usePriceScalesNumberStore();
  const { priceScalePosition, setPriceScalePosition } = usePriceScalePositionStore();
  const { priceScaleOptions } = usePriceScaleOptionsStore();
  const { currency, setCurrency } = usePriceCurrencyStore();
  const { priceFormatter } = useChartLocalizationOptionsStore();

  const chartOptions = useMemo(() => {
    const localizationOpts: DeepPartial<ChartOptions> = priceFormatter
      ? {
          localization: {
            priceFormatter,
          },
        }
      : {};

    if (priceScalesNumber === 1) {
      const opts: DeepPartial<ChartOptions> =
        priceScalePosition === "left"
          ? { leftPriceScale: { visible: true }, rightPriceScale: { visible: false } }
          : { leftPriceScale: { visible: false }, rightPriceScale: { visible: true } };

      return withChartCommonOptions({
        ...localizationOpts,
        ...opts,
      });
    }

    return withChartCommonOptions({
      ...localizationOpts,
      leftPriceScale: { visible: true },
      rightPriceScale: { visible: true },
    });
  }, [withChartCommonOptions, priceScalePosition, priceScalesNumber, priceFormatter]);

  return (
    <ChartWidgetCard
      title="Scales"
      subTitle="Customize the scales of the chart"
      sampleConfig={samplesLinks.Scales}
    >
      <ScrollableContainer sx={{ marginBottom: 2 }}>
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
          disabled={priceScalesNumber === 2}
        />
        <SelectFormField
          label="Price currency"
          value={currency}
          setValue={setCurrency}
          options={currencySelectOptions}
          disabled={priceScaleType === "logarithmic" || priceScaleType === "percentage"}
        />
      </ScrollableContainer>
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
    </ChartWidgetCard>
  );
};

export { Scales };
