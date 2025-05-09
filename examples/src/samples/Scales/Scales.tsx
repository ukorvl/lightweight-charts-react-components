import { FormControl, FormHelperText, MenuItem, Select } from "@mui/material";
import {
  AreaSeries,
  Chart,
  PriceScale,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import { colors } from "@/colors";
import { chartCommonOptions } from "@/common/chartCommonOptions";
import { samplesLinks } from "@/samples";
import { ScrollableContainer } from "@/ui/ScrollableContainer";
import {
  mainSeriesData,
  priceScalePositionSelectOptions,
  priceScaleTypeSelectOptions,
  priceScalesNumberSelectOptions,
  secondSeriesData,
  usePriceScaleOptionsStore,
  usePriceScalePositionStore,
  usePriceScaleTypeStore,
  usePriceScalesNumberStore,
} from "./scalesStore";
import { ChartWidgetCard } from "../../ui/ChartWidgetCard";

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
        {options.map(({ value, label }) => (
          <MenuItem key={label} value={value}>
            {label}
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
      </ScrollableContainer>
      <Chart options={chartCommonOptions} containerProps={{ style: { flexGrow: "1" } }}>
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
        <TimeScale>
          <TimeScaleFitContentTrigger deps={[]} />
        </TimeScale>
      </Chart>
    </ChartWidgetCard>
  );
};

export { Scales };
