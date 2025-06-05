import {
  Container,
  Link,
  Stack,
  Typography,
  keyframes,
  styled,
  Divider,
} from "@mui/material";
import { colors } from "./colors";
import { Footer } from "./ui/Footer";
import type { ReactNode } from "react";

type LayoutProps = {
  children?: ReactNode;
};

const gradientAnimation = keyframes`
  0%   { background-position: 50% 0; }
  12.5% { background-position: 70% 0; }
  25%  { background-position: 75% 0; }
  37.5% { background-position: 70% 0; }
  50%  { background-position: 60% 0; }
  62.5% { background-position: 55% 0; }
  75%  { background-position: 50% 0; }
  87.5% { background-position: 35% 0; }
  100% { background-position: 20% 0; }
`;

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
