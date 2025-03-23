import { Container } from "@mui/material";
import { BasicAreaSeries } from "./charts/BasicAreaSeries";
import { LayoutGrid } from "./components/LayoutGrid";
import { BasicLineSeries } from "./charts/BasicLineSeries";

export const App = () => {
  return (
    <Container>
      <LayoutGrid>
        <BasicAreaSeries />
        <BasicLineSeries />
      </LayoutGrid>
    </Container>
  );
};
