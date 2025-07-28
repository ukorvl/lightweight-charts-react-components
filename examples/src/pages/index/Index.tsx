import { Link, Stack, Typography, Box } from "@mui/material";
import { Suspense } from "react";
import { lazyWithRetry } from "@/common/lazyWithRetry";
import { logoKeyframes, textBgKeyframes } from "@/common/styles";
import { ProgressBox } from "@/ui/ProgressBox";
import { colors } from "../../common/colors";

const Contents = lazyWithRetry(() => import("./Contents"), "Contents");

export const Index = () => {
  const {
    VITE_APP_DEFAULT_TITLE,
    VITE_LIGHTWEIGHT_CHARTS_REPO_URL,
    VITE_GITHUB_STATIC_ASSETS_BASE_URL,
  } = import.meta.env;
  return (
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
          userSelect: "none",
          overflow: "visible",
          ":before": {
            content: '""',
            position: "absolute",
            zIndex: 2,
            pointerEvents: "none",
            top: "-50%",
            left: "-50%",
            width: "200%",
            height: "200%",
            background: `radial-gradient(
                circle at center,
                ${colors.violet}85,
                ${colors.blue100}30 40%,
                ${colors.blue100}10 60%,
                transparent 100%)`,
            filter: "blur(60px) brightness(0.75)",
            transition: "filter 0.3s ease-in-out",
          },
          ":hover": {
            ":before": {
              filter: "blur(80px) brightness(1)",
            },
            "@media (prefers-reduced-motion: reduce)": {
              ":before": {
                filter: "blur(60px) brightness(0.75)",
              },
            },
          },
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            transformOrigin: "center",
            ":hover": {
              animation: `${logoKeyframes} 1.5s ease-in-out infinite`,
              "@media (prefers-reduced-motion: reduce)": {
                animation: "none",
              },
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
      <Suspense fallback={<ProgressBox />}>
        <Contents />
      </Suspense>
    </Stack>
  );
};
