import { Container, Link, Stack, Typography, styled, Divider } from "@mui/material";
import { colors } from "./colors";
import { gradientAnimation } from "./styles";
import { Footer } from "./ui/Footer";
import type { ReactNode } from "react";

type LayoutProps = {
  children?: ReactNode;
};

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

export const Layout = ({ children }: LayoutProps) => {
  const { VITE_GITHUB_URL, VITE_NPM_PACKAGE_URL } = import.meta.env;
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
        {/* <GradientLink underline="none" href="/#/terminal">
          Terminal
        </GradientLink> */}
        <Typography color="textDisabled">Terminal</Typography>
        <Typography color="textDisabled">Docs</Typography>
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
      {children}
      <Footer
        sx={{
          marginTop: 6,
          marginBottom: { xs: 8, md: 12, xl: 16 },
        }}
      />
    </Container>
  );
};
