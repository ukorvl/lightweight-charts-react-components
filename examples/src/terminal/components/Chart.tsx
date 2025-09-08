import { Stack } from "@mui/material";
import { withChartCommonOptions } from "@/common/chartCommonOptions";
import {
  CandlestickSeries,
  Chart as ChartComponent,
  Pane,
  TimeScale,
  TimeScaleFitContentTrigger,
} from "lightweight-charts-react-components";
import type { StackProps } from "@mui/material";

type ChartProps = Pick<StackProps, "sx">;

const Chart = ({ sx }: ChartProps) => {
  return (
    <Stack
      sx={{
        flexGrow: 1,
        position: "relative",
        ...sx,
      }}
    >
      <ChartComponent
        options={withChartCommonOptions({})}
        containerProps={{ style: { flexGrow: "1" } }}
      >
        <Pane>
          <CandlestickSeries
            data={[
              { time: "2021-01-01", open: 1, high: 2, low: 0.5, close: 1.5 },
              { time: "2021-01-02", open: 1.5, high: 2.5, low: 1, close: 2 },
              { time: "2021-01-03", open: 2, high: 3, low: 1.5, close: 2.5 },
            ]}
            options={{ priceLineVisible: false }}
          />
        </Pane>
        <TimeScale>
          <TimeScaleFitContentTrigger deps={[]} />
        </TimeScale>
      </ChartComponent>
    </Stack>
  );
};

export { Chart };
