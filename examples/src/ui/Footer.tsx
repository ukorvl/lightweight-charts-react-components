import { Divider, Link, Stack, SvgIcon, Typography } from "@mui/material";
import { GitHub } from "@mui/icons-material";
import { colors } from "@/colors";
import { styled } from "@mui/material/styles";

const FooterText = styled(Typography)(() => ({
  color: colors.gray,
  fontSize: "0.8rem",
}));

const FirmaIcon = () => (
  <SvgIcon>
    {/* Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.097-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-.098z"
      />
    </svg>
  </SvgIcon>
);

const Footer = () => {
  const {
    VITE_GITHUB_URL,
    VITE_LIGHTWEIGHT_CHARTS_VERSION,
    VITE_LIGHTWEIGHT_CHARTS_REACT_COMPONENTS_VERSION,
    VITE_DESIGN_SYSTEM_URL,
    VITE_SITE_PUBLISHED_TIMESTAMP,
  } = import.meta.env;

  return (
    <Stack
      component="footer"
      direction={{ xs: "column", sm: "row" }}
      spacing={{ xs: 1, sm: 2, md: 4 }}
      justifyContent="space-around"
      alignItems="center"
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
    >
      <Stack useFlexGap spacing={2} justifyContent="center">
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
          <FirmaIcon />
          Design System
        </Link>
      </Stack>
      <Stack useFlexGap spacing={2} justifyContent="center">
        <FooterText>{`lightweight-charts-react-components version: v${VITE_LIGHTWEIGHT_CHARTS_REACT_COMPONENTS_VERSION}`}</FooterText>
        <FooterText>{`lightweight-charts version: v${VITE_LIGHTWEIGHT_CHARTS_VERSION}`}</FooterText>
      </Stack>
      <Stack useFlexGap spacing={2} justifyContent="center">
        <FooterText>{`published: ${VITE_SITE_PUBLISHED_TIMESTAMP}`}</FooterText>
        <FooterText
          aria-hidden="true"
          sx={{
            visibility: "hidden",
          }}
        >
          {/* Hidden text to properly align elements in the flex container */}
          Text
        </FooterText>
      </Stack>
    </Stack>
  );
};

export { Footer };
