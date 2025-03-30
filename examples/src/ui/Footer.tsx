import { Divider, Link, Stack, Typography } from "@mui/material";
import { GitHub } from "@mui/icons-material";
import { colors } from "@/colors";
import { styled } from "@mui/material/styles";
import { FigmaIcon } from "./FigmaIcon";
import { TradingviewIcon } from "./TradingviewIcon";
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
  } = import.meta.env;

  return (
    <Stack
      component="footer"
      direction={{ xs: "column", sm: "row" }}
      spacing={{ xs: 1, sm: 2, md: 4 }}
      justifyContent="space-around"
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
      <Stack useFlexGap spacing={2}>
        <Link
          href={VITE_GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <GitHub />
          GitHub repository
        </Link>
        <Link
          href={VITE_DESIGN_SYSTEM_URL}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <FigmaIcon />
          Design System
        </Link>
        <Link
          href={VITE_TRADINGVIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <TradingviewIcon />
          <Typography>TradingView</Typography>
        </Link>
      </Stack>
      <Stack useFlexGap spacing={2}>
        <FooterText>{`lightweight-charts-react-components version: v${VITE_LIGHTWEIGHT_CHARTS_REACT_COMPONENTS_VERSION}`}</FooterText>
        <FooterText>{`lightweight-charts version: v${VITE_LIGHTWEIGHT_CHARTS_VERSION}`}</FooterText>
        <FooterText>{`site published: ${VITE_SITE_PUBLISHED_TIMESTAMP}`}</FooterText>
      </Stack>
      <Stack useFlexGap spacing={2}>
        <FooterText>TradingView Lightweight Charts™</FooterText>
        <FooterText>
          <Link
            href={VITE_LIGHTWEIGHT_CHARTS_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Lightweight charts
          </Link>
        </FooterText>
        <FooterText>
          <Link
            href={VITE_TRADINGVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            TradingView
          </Link>
        </FooterText>
      </Stack>
    </Stack>
  );
};

export { Footer };
