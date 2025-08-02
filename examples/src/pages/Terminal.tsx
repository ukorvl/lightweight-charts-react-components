import { Stack, useTheme } from "@mui/material";
import { ErrorBoundary } from "react-error-boundary";
import { ChartContainer } from "@/terminal/components/ChartContainer";
import { ErrorFallback } from "@/ui/ErrorFallback";

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
      <ErrorBoundary fallbackRender={ErrorFallback}>
        <ChartContainer />
      </ErrorBoundary>
    </Stack>
  );
};

// eslint-disable-next-line import/no-default-export
export default Terminal;
