import GitHub from "@mui/icons-material/GitHub";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { ErrorBoundary } from "react-error-boundary";
import type { SampleConfig } from "@/samples";
import { CodesandboxIcon } from "./CodesandboxIcon";
import { StackBlitzIcon } from "./StackBlitzIcon";
import { WidgetCardShell } from "./WidgetCardShell";
import type { FC, ReactNode } from "react";
import type { FallbackProps } from "react-error-boundary";

type ChartWidgetCardProps = {
  title: string;
  subTitle?: string;
  children?: ReactNode;
} & ActionPanelProps;

type ActionPanelProps = {
  sampleConfig: SampleConfig;
};

type ActionPanelElementProps = {
  disabled?: boolean;
  tooltipTitle: string;
  tooltipDisabledTitle: string;
  href?: string;
  children: ReactNode;
  isExternal?: boolean;
  hrefTarget?: string;
};

const ActionPanelElement = ({
  tooltipDisabledTitle,
  tooltipTitle,
  children,
  href,
  disabled = false,
  isExternal = true,
  hrefTarget = "_blank",
}: ActionPanelElementProps) => {
  return (
    <Tooltip
      title={disabled ? tooltipDisabledTitle : tooltipTitle}
      placement="bottom"
      describeChild
    >
      <Link
        component={disabled ? "span" : "a"}
        href={disabled ? undefined : href}
        target={disabled ? undefined : hrefTarget}
        rel={disabled || !isExternal ? undefined : "noopener noreferrer"}
        aria-label={disabled ? undefined : tooltipTitle}
        color={disabled ? "textDisabled" : "secondary"}
      >
        {children}
      </Link>
    </Tooltip>
  );
};

const ActionPanel: FC<ActionPanelProps> = ({
  sampleConfig: { github, codesandbox, stackblitz },
}) => {
  return (
    <Stack direction="row" spacing={1.5}>
      <ActionPanelElement
        disabled={!github}
        tooltipTitle="Open the source in GitHub"
        tooltipDisabledTitle="Source not available"
        href={github}
      >
        <GitHub />
      </ActionPanelElement>
      <ActionPanelElement
        disabled={!codesandbox}
        tooltipTitle="View in CodeSandbox"
        tooltipDisabledTitle="CodeSandbox not available"
        href={codesandbox}
      >
        <CodesandboxIcon />
      </ActionPanelElement>
      <ActionPanelElement
        disabled={!stackblitz}
        tooltipTitle="Edit in StackBlitz"
        tooltipDisabledTitle="StackBlitz not available"
        href={stackblitz}
      >
        <StackBlitzIcon inheritViewBox />
      </ActionPanelElement>
    </Stack>
  );
};

const ErrorFallback = ({ error }: FallbackProps) => {
  const { message } = error;

  return (
    <Stack justifyContent="center" alignItems="center" flexGrow={1} textAlign="center">
      <Typography variant="h6" color="info">
        An error occurred while rendering this example:
      </Typography>
      <Typography color="error" fontFamily="Roboto Mono, monospace" mt={1}>
        {message}
      </Typography>
    </Stack>
  );
};

const ChartWidgetCard: FC<ChartWidgetCardProps> = ({
  children,
  title,
  subTitle,
  sampleConfig,
}) => {
  return (
    <WidgetCardShell
      title={title}
      subTitle={subTitle}
      action={<ActionPanel sampleConfig={sampleConfig} />}
      sx={{
        minWidth: 275,
        borderRadius: 3,
        height: { xs: 480, md: 575 },
      }}
    >
      <ErrorBoundary fallbackRender={ErrorFallback}>{children}</ErrorBoundary>
    </WidgetCardShell>
  );
};

export { ChartWidgetCard };
