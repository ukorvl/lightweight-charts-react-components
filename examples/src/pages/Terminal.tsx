import { Stack, useTheme } from "@mui/material";
import { ErrorBoundary } from "react-error-boundary";
import { ControlledMeta } from "@/common/ControlledMeta";
import { ControlledTitle } from "@/common/ControlledTitle";
import { ChartContainer } from "@/terminal/components/ChartContainer";
import { ErrorFallback } from "@/ui/ErrorFallback";
import { homepage } from "../../package.json";
import "../terminal/data/populate";

const { VITE_APP_DEFAULT_TITLE } = import.meta.env;

const PageMeta = () => {
  return (
    <>
      <ControlledTitle title={`${VITE_APP_DEFAULT_TITLE} - Terminal`} />
      <ControlledMeta
        name="description"
        content="Trading terminal built with lightweight-charts-react-components for visualizing financial data in a React.js application."
      />
      <ControlledMeta
        name="keywords"
        content="terminal, lightweight-charts, react, examples, charts, visualization, react components, financial data"
      />
      <ControlledMeta
        property="og:title"
        content="Lightweight Charts React Components - Terminal"
      />
      <ControlledMeta
        property="og:description"
        content="Explore the terminal example built with lightweight-charts-react-components for visualizing financial data in a React.js application."
      />
      <ControlledMeta property="og:url" content={`${homepage}/terminal`} />
      <ControlledMeta
        name="twitter:title"
        content="Lightweight Charts React Components - Terminal"
      />
      <ControlledMeta
        name="twitter:description"
        content="Explore the terminal example built with lightweight-charts-react-components for visualizing financial data in a React.js application."
      />
      <ControlledMeta name="twitter:url" content={`${homepage}/terminal`} />
    </>
  );
};

const Terminal = () => {
  const { spacing } = useTheme();
  const navbarHeight = "24px";

  return (
    <Stack
      component="main"
      spacing={{ xs: 4 }}
      useFlexGap
      sx={{
        marginTop: 4,
        marginBottom: 12,
        height: `calc(100vh - (${spacing(4)} * 3) - ${navbarHeight})`,
      }}
    >
      <PageMeta />
      <ErrorBoundary fallbackRender={ErrorFallback}>
        <ChartContainer />
      </ErrorBoundary>
    </Stack>
  );
};

// eslint-disable-next-line import/no-default-export
export default Terminal;
