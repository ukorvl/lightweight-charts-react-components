import { Container, Link, Stack, Typography, styled, Divider } from "@mui/material";
import { Link as WouterLink } from "wouter";
import { gradientLinkStyles } from "./common/styles";
import { Footer } from "./ui/Footer";
import type { LinkProps } from "@mui/material";
import type { ReactNode } from "react";

type LayoutProps = {
  children?: ReactNode;
};

const GradientLink = styled(Link)(() => gradientLinkStyles);
const InternalGradientLink = (props: LinkProps) => {
  const { href, sx, ...other } = props;

  return (
    <Link
      component={WouterLink}
      href={href}
      sx={{
        ...gradientLinkStyles,
        ...sx,
      }}
      {...other}
    />
  );
};

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
        <InternalGradientLink href="/">Examples</InternalGradientLink>
        <InternalGradientLink href="/terminal">Terminal</InternalGradientLink>
        <Typography color="textDisabled">Docs</Typography>
        <Divider aria-hidden="true" orientation="vertical" flexItem />
        <GradientLink target="_blank" rel="noopener noreferrer" href={VITE_GITHUB_URL}>
          GitHub
        </GradientLink>
        <GradientLink
          rel="noopener noreferrer"
          target="_blank"
          href={VITE_NPM_PACKAGE_URL}
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
