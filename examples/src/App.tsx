import { Container, Link, Stack, Typography } from "@mui/material";
import { LayoutGrid } from "./ui/LayoutGrid";
import { BasicSeries } from "./samples/BasicSeries/BasicSeries";
import { colors } from "./colors";
import { Footer } from "./ui/Footer";
import { CustomSeries } from "./samples/CustomSeries/CustomSeries";

export const App = () => {
  const { VITE_APP_DEFAULT_TITLE, VITE_LIGHTWEIGHT_CHARTS_REPO_URL } =
    import.meta.env;
  return (
    <Container>
      <Stack
        spacing={{ xs: 4, sm: 6 }}
        useFlexGap
        sx={{
          marginTop: 6,
          marginBottom: 12,
        }}
      >
        <Typography
          sx={{
            background: `linear-gradient(45deg, ${colors.red}, ${colors.blue})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: { xs: "2rem", sm: "3rem", md: "5rem" },
            fontWeight: "bold",
            textAlign: "center",
            wordBreak: "keep-all",
            lineHeight: 1,
            userSelect: "none",
            marginInline: { md: 4 },
          }}
          component="h1"
        >
          {VITE_APP_DEFAULT_TITLE}
        </Typography>
        <Typography
          sx={{
            textAlign: "center",
            fontSize: "1.1rem",
            marginInline: { xs: 4, sm: 12, md: 20 },
          }}
          component="p"
        >
          This library is a set of React components that wraps the{" "}
          {VITE_LIGHTWEIGHT_CHARTS_REPO_URL ? (
            <Link
              underline="hover"
              href={VITE_LIGHTWEIGHT_CHARTS_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Lightweight-charts library
            </Link>
          ) : (
            "Lightweight-charts library"
          )}
          . It provides a simple declarative way to use the
          Lightweight-charts library in your React application.
        </Typography>
        <LayoutGrid>
          <BasicSeries />
          <CustomSeries />
        </LayoutGrid>
        <Footer />
      </Stack>
    </Container>
  );
};
