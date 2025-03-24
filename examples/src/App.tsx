import { Container } from "@mui/material";
import { BasicAreaSeriesChart } from "./charts/BasicAreaSeriesChart";
import { LayoutGrid } from "./components/LayoutGrid";
import { BasicLineSeriesChart } from "./charts/BasicLineSeriesChart";
import { BasicHistogramSeriesChart } from "./charts/BasicHistogramSeriesChart";
import { BasicCandlestickSeriesChart } from "./charts/BasicCandlestickSeriesChart";
import { BasicBaselineAreaSeriesChart } from "./charts/BasicBaselineAreaSeriesChart";
import { BasicBarAreaSeriesChart } from "./charts/BasicBarAreaSeriesChart";

export const App = () => {
  return (
    <Container>
      <LayoutGrid>
        <BasicAreaSeriesChart />
        <BasicLineSeriesChart />
        <BasicHistogramSeriesChart />
        <BasicCandlestickSeriesChart />
        <BasicBaselineAreaSeriesChart />
        <BasicBarAreaSeriesChart />
      </LayoutGrid>
    </Container>
  );
};
