import { Container, Link, Stack, Typography, styled, Box, Divider } from "@mui/material";
import { colors } from "./colors";
import { BasicSeries } from "./samples/BasicSeries/BasicSeries";
import { CompareSeries } from "./samples/CompareSeries/CompareSeries";
import { CustomSeries } from "./samples/CustomSeries/CustomSeries";
import { InfiniteData } from "./samples/InfiniteData/InfiniteData";
import { WithLegend } from "./samples/Legend/WithLegend";
import { Markers } from "./samples/Markers/Markers";
import { Panes } from "./samples/Panes/Panes";
import { PriceLines } from "./samples/PriceLines/PriceLines";
import { Primitives } from "./samples/Primitives/Primitives";
import { RangeSwitcher } from "./samples/RangeSwitcher/RangeSwitcher";
import { Scales } from "./samples/Scales/Scales";
import { Tooltips } from "./samples/Tooltips/Tooltips";
import { Watermark } from "./samples/Watermark/Watermark";
import { gradientAnimation, logoKeyframes, textBgKeyframes } from "./styles";
import { Footer } from "./ui/Footer";
import { LayoutGrid } from "./ui/LayoutGrid";

const GradientLink = styled(Link)(() => ({
  fontWeight: "bold",
  background: `linear-gradient(90deg, ${colors.blue} 50%, ${colors.red} 70%)`,
  backgroundSize: "300% 300%",
  backgroundPosition: "0 0",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  transition: "background-position 0.3s ease-in-out",
  "&:hover": {
    animation: `${gradientAnimation} 2s ease-in-out infinite`,
    "@media (prefers-reduced-motion: reduce)": {
      animation: "none",
      backgroundPosition: "0 0",
    },
  },
}));

export const App = () => {
  const {
    VITE_APP_DEFAULT_TITLE,
    VITE_LIGHTWEIGHT_CHARTS_REPO_URL,
    VITE_GITHUB_URL,
    VITE_GITHUB_STATIC_ASSETS_BASE_URL,
    VITE_NPM_PACKAGE_URL,
  } = import.meta.env;
  return (
    <Container
      maxWidth="xl"
      sx={{
        paddingInline: { xs: 2, sm: 4, lg: 4 },
      }}
    >
      <Stack
        sx={{
          marginTop: 4,
        }}
        component="nav"
        direction="row"
        justifyContent={{ xs: "center", sm: "flex-end" }}
        useFlexGap
        gap={4}
      >
        <GradientLink underline="none" href="#">
          Examples
        </GradientLink>
        <Typography color="textDisabled">Terminal</Typography>
        <Divider aria-hidden="true" orientation="vertical" flexItem />
        <GradientLink
          underline="none"
          target="_blank"
          rel="noopener noreferrer"
          href={VITE_GITHUB_URL}
        >
          GitHub
        </GradientLink>
        <GradientLink
          rel="noopener noreferrer"
          target="_blank"
          href={VITE_NPM_PACKAGE_URL}
          underline="none"
        >
          Npm
        </GradientLink>
      </Stack>
      <Stack
        component="main"
        spacing={{ xs: 4 }}
        useFlexGap
        sx={{
          marginTop: 4,
          marginBottom: 12,
        }}
      >
        <Typography
          sx={{
            background: `linear-gradient(45deg, ${colors.red}, ${colors.blue100})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: { xs: "2rem", sm: "3rem", md: "4rem", lg: "5rem" },
            fontWeight: "bold",
            textAlign: "center",
            wordBreak: "keep-all",
            lineHeight: 1,
            userSelect: "none",
            marginInline: { sm: 6, md: 12, lg: 28 },
            transition:
              "background-position 0.3s ease-in-out, background-size 0.3s ease-in-out",
            animation: `${textBgKeyframes} 2s ease-in-out forwards`,
            backgroundSize: "200% 200%",
            "@media (prefers-reduced-motion: reduce)": {
              animation: "none",
              backgroundSize: "100% 100%",
            },
          }}
          component="h1"
        >
          {VITE_APP_DEFAULT_TITLE}
        </Typography>
        <Box
          sx={{
            width: { xs: 120, md: 200 },
            height: { xs: 120, md: 200 },
            alignSelf: "center",
            position: "relative",
            overflow: "visible",
            userSelect: "none",
            transformOrigin: "center",
            ":hover": {
              animation: `${logoKeyframes} 1.5s ease-in-out infinite`,
              ":before": {
                opacity: 1,
              },
              "@media (prefers-reduced-motion: reduce)": {
                animation: "none",
                ":before": {
                  opacity: 0.75,
                },
              },
            },
            ":before": {
              content: '""',
              position: "absolute",
              pointerEvents: "none",
              top: "-50%",
              left: "-50%",
              width: "200%",
              height: "200%",
              background: `radial-gradient(
                circle at center,
                ${colors.violet}95,
                ${colors.blue100}30 40%,
                ${colors.blue100}10 60%,
                transparent 100%)`,
              filter: "blur(60px)",
              transition: "opacity 0.6s ease-in-out",
              opacity: 0.75,
            },
          }}
        >
          <img
            alt=""
            src={`${VITE_GITHUB_STATIC_ASSETS_BASE_URL}/logo.svg`}
            loading="lazy"
            decoding="async"
            width="100%"
            height="100%"
          />
        </Box>
        <Typography
          sx={{
            textAlign: "center",
            fontSize: "1.1rem",
            marginInline: { xs: 4, sm: 12, md: 28 },
            marginBottom: { xs: 2, sm: 4 },
          }}
          component="h2"
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
          . It provides a simple declarative way to use the Lightweight-charts library in
          your React application.
        </Typography>
        <LayoutGrid component="section" aria-label="Examples of library usage">
          <BasicSeries />
          <CustomSeries />
          <RangeSwitcher />
          <Panes />
          <Watermark />
          <WithLegend />
          <CompareSeries />
          <Scales />
          <Tooltips />
          <Markers />
          <InfiniteData />
          <PriceLines />
          <Primitives />
        </LayoutGrid>
      </Stack>
      <Footer
        sx={{
          marginTop: 6,
          marginBottom: { xs: 8, md: 12, xl: 16 },
        }}
      />
    </Container>
  );
};
