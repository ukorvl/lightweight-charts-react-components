import { GitHub, ContentCopy } from "@mui/icons-material";
import { Divider, IconButton, Link, Stack, Tooltip, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import copy from "copy-to-clipboard";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { colors } from "@/common/colors";
import { FigmaIcon } from "./FigmaIcon";
import { GitHubStarsCounter } from "./GitHubStarsCounter";
import type { ComponentProps, FC } from "react";

type FooterProps = {
  sx?: ComponentProps<typeof Stack>["sx"];
};

type CopyIconProps = {
  textToCopy: string;
  ariaLabel?: string;
};

const FooterText = styled(Typography)(() => ({
  color: colors.gray,
  fontSize: "0.8rem",
  textWrap: "nowrap",
}));

const CopyIcon: FC<CopyIconProps> = ({ textToCopy, ariaLabel }) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timeoutId = setTimeout(() => setIsCopied(false), 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [isCopied]);

  return (
    <Tooltip title={isCopied ? "Copied" : "Copy"} leaveDelay={250} placement="top">
      <IconButton
        onClick={() => {
          copy(textToCopy);
          setIsCopied(true);
        }}
        aria-label={ariaLabel}
        color="primary"
        sx={{ paddingBlock: 0 }}
      >
        <ContentCopy sx={{ fontSize: "1rem" }} />
      </IconButton>
    </Tooltip>
  );
};

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
    VITE_BRAND_IDENTITY_CREATOR_URL,
    VITE_BRAND_IDENTITY_CREATOR_NAME,
    VITE_BUY_ME_A_COFFEE_URL,
    VITE_GITHUB_SPONSORS_URL,
  } = import.meta.env;

  return (
    <Stack
      component="footer"
      direction={{ xs: "column", md: "row" }}
      spacing={{ xs: 2, md: 6, lg: 8 }}
      justifyContent="center"
      alignItems={{ xs: "center", md: "flex-start" }}
      divider={<Divider aria-hidden="true" orientation="vertical" flexItem />}
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
        <Stack useFlexGap direction="row" alignItems="center">
          <FooterText>
            {`Lightweight-charts-react-components version: ${VITE_LIGHTWEIGHT_CHARTS_REACT_COMPONENTS_VERSION}`}
          </FooterText>
          <CopyIcon
            textToCopy={VITE_LIGHTWEIGHT_CHARTS_REACT_COMPONENTS_VERSION}
            ariaLabel="Copy version of the Lightweight-charts-react-components"
          />
        </Stack>
        <Stack useFlexGap direction="row" alignItems="center">
          <FooterText>{`Lightweight-charts version: ${VITE_LIGHTWEIGHT_CHARTS_VERSION}`}</FooterText>
          <CopyIcon
            textToCopy={VITE_LIGHTWEIGHT_CHARTS_VERSION}
            ariaLabel="Copy version of the Lightweight-charts"
          />
        </Stack>
        <FooterText>
          Site{" "}
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
          {`: ${dayjs.utc(VITE_SITE_PUBLISHED_TIMESTAMP).local().format("YYYY-MM-DD")}`}
        </FooterText>
        <GitHubStarsCounter />
      </Stack>
      <Stack
        useFlexGap
        spacing={2}
        alignItems={{
          xs: "cnter",
          sm: "flex-end",
        }}
      >
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
            textWrap: "nowrap",
          }}
        >
          <GitHub fontSize="small" />
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
            textWrap: "nowrap",
          }}
        >
          <FigmaIcon
            sx={{
              fontSize: "1rem",
            }}
          />
          Design System
        </Link>
        {VITE_BRAND_IDENTITY_CREATOR_NAME && VITE_BRAND_IDENTITY_CREATOR_URL && (
          <FooterText>
            Brand identity by{" "}
            <Link
              underline="hover"
              href={VITE_BRAND_IDENTITY_CREATOR_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {VITE_BRAND_IDENTITY_CREATOR_NAME}
            </Link>
          </FooterText>
        )}
        {VITE_GITHUB_SPONSORS_URL && (
          <FooterText>
            <Link
              underline="hover"
              href={VITE_GITHUB_SPONSORS_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Sponsor
            </Link>{" "}
            this project
          </FooterText>
        )}
        {VITE_BUY_ME_A_COFFEE_URL && (
          <FooterText
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Link
              underline="hover"
              href={VITE_BUY_ME_A_COFFEE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Buy me a coffee
            </Link>
            <Typography paddingLeft={1} component="span" fontSize={16}>
              ☕
            </Typography>
          </FooterText>
        )}
      </Stack>
    </Stack>
  );
};

export { Footer };
