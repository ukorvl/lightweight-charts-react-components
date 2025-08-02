import { Close, Menu } from "@mui/icons-material";
import {
  Container,
  Link,
  Stack,
  Typography,
  styled,
  Divider,
  SwipeableDrawer,
  IconButton,
  useTheme,
} from "@mui/material";
import { useState, type ReactNode } from "react";
import { Link as WouterLink } from "wouter";
import { gradientLinkStyles } from "./common/styles";
import { Footer } from "./ui/Footer";
import type { LinkProps } from "@mui/material";

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
  const { spacing } = useTheme();
  const marginTop = 4;
  const paddingInlineXs = 2;
  const iconFontSize = 40;
  const { VITE_GITHUB_URL, VITE_NPM_PACKAGE_URL } = import.meta.env;
  const [drawerOpened, setDrawerOpened] = useState(false);
  const closeDrawer = () => setDrawerOpened(false);
  const openDrawer = () => setDrawerOpened(true);
  const iOS =
    typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <Container
      maxWidth="xl"
      sx={{
        paddingInline: { xs: paddingInlineXs, sm: 4, lg: 4 },
      }}
    >
      <Stack
        sx={{
          marginTop,
          height: "24px",
        }}
        component="nav"
        direction="row"
        justifyContent={{
          xs: "flex-end",
          sm: "center",
          md: "flex-end",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          gap={4}
          useFlexGap
          display={{ xs: "none", sm: "flex" }}
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
        <Stack
          direction="row"
          alignItems="center"
          gap={4}
          useFlexGap
          display={{ xs: "flex", sm: "none" }}
        >
          <IconButton color="info" aria-label="toggle menu" onClick={openDrawer}>
            <Menu
              sx={{
                fontSize: iconFontSize,
              }}
            />
          </IconButton>
          <SwipeableDrawer
            keepMounted={false}
            anchor="right"
            open={drawerOpened}
            onOpen={openDrawer}
            onClose={closeDrawer}
            disableBackdropTransition={!iOS}
            disableDiscovery={iOS}
            data-testid="mobile-menu"
          >
            <Stack
              sx={{
                width: "90vw",
                paddingInline: 2,
                paddingBlock: 6,
                gap: 4,
                position: "relative",
              }}
              useFlexGap
              justifyContent="center"
              alignItems="center"
            >
              <InternalGradientLink href="/" onClick={closeDrawer}>
                Examples
              </InternalGradientLink>
              <InternalGradientLink href="/terminal" onClick={closeDrawer}>
                Terminal
              </InternalGradientLink>
              <Typography color="textDisabled" onClick={closeDrawer}>
                Docs
              </Typography>
              <Divider aria-hidden="true" flexItem />
              <GradientLink
                target="_blank"
                rel="noopener noreferrer"
                href={VITE_GITHUB_URL}
                onClick={closeDrawer}
              >
                GitHub
              </GradientLink>
              <GradientLink
                rel="noopener noreferrer"
                target="_blank"
                href={VITE_NPM_PACKAGE_URL}
                onClick={closeDrawer}
              >
                Npm
              </GradientLink>
              <IconButton
                color="info"
                aria-label="Close menu"
                onClick={closeDrawer}
                sx={{
                  position: "absolute",
                  top: spacing(marginTop),
                  right: spacing(paddingInlineXs),
                }}
              >
                <Close
                  sx={{
                    fontSize: iconFontSize,
                  }}
                />
              </IconButton>
            </Stack>
          </SwipeableDrawer>
        </Stack>
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
