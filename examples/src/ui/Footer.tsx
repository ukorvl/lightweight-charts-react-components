import { Divider, Link, Stack, Typography } from "@mui/material";
import { GitHub } from "@mui/icons-material";
import { colors } from "@/colors";
import { styled } from "@mui/material/styles";
import { FigmaIcon } from "./FigmaIcon";
import { ComponentProps, FC } from "react";

type FooterProps = {
  sx?: ComponentProps<typeof Stack>["sx"];
};

const FooterText = styled(Typography)(() => ({
  color: colors.gray,
  fontSize: "0.8rem",
}));

const Footer: FC<FooterProps> = ({ sx }) => {
  const {
    VITE_GITHUB_URL,
    VITE_LIGHTWEIGHT_CHARTS_VERSION,
    VITE_LIGHTWEIGHT_CHARTS_REACT_COMPONENTS_VERSION,
    VITE_DESIGN_SYSTEM_URL,
    VITE_SITE_PUBLISHED_TIMESTAMP,
    VITE_TRADINGVIEW_URL,
    VITE_LIGHTWEIGHT_CHARTS_REPO_URL,
    VITE_PUBLISH_COMMIT_URL,
  } = import.meta.env;

  return (
    <Stack
      component="footer"
      direction={{ xs: "column", sm: "row" }}
      spacing={{ xs: 2, sm: 4, md: 8 }}
      justifyContent="center"
      alignItems="flex-start"
      divider={
        <Divider
          aria-hidden="true"
          orientation="vertical"
          flexItem
          sx={{
            backgroundColor: colors.gray,
          }}
        />
      }
      useFlexGap
      sx={sx}
    >
      <Stack useFlexGap spacing={2} alignItems="center">
        <FooterText>TradingView Lightweight Charts™</FooterText>
        <FooterText>
          <Link
            underline="hover"
            href={VITE_LIGHTWEIGHT_CHARTS_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Lightweight charts
          </Link>
        </FooterText>
        <FooterText>
          <Link
            underline="hover"
            href={VITE_TRADINGVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            TradingView
          </Link>
        </FooterText>
      </Stack>
      <Stack useFlexGap spacing={2} alignItems="center">
        <FooterText>{`lightweight-charts-react-components version: v${VITE_LIGHTWEIGHT_CHARTS_REACT_COMPONENTS_VERSION}`}</FooterText>
        <FooterText>{`lightweight-charts version: v${VITE_LIGHTWEIGHT_CHARTS_VERSION}`}</FooterText>
        <FooterText>
          site{" "}
          {VITE_PUBLISH_COMMIT_URL ? (
            <Link
              underline="hover"
              href={VITE_PUBLISH_COMMIT_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              published
            </Link>
          ) : (
            "published"
          )}
          {`: ${VITE_SITE_PUBLISHED_TIMESTAMP}`}
        </FooterText>
      </Stack>
      <Stack useFlexGap spacing={2}>
        <Link
          href={VITE_GITHUB_URL}
          underline="hover"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontSize: "0.8rem",
          }}
        >
          <GitHub />
          GitHub repository
        </Link>
        <Link
          href={VITE_DESIGN_SYSTEM_URL}
          underline="hover"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontSize: "0.8rem",
          }}
        >
          <FigmaIcon />
          Design System
        </Link>
      </Stack>
    </Stack>
  );
};

export { Footer };
