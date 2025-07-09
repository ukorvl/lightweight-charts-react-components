import { GitHub, TableChart } from "@mui/icons-material";
import {
  Card,
  CardContent,
  CardHeader,
  Stack,
  Link,
  Tooltip,
  Typography,
} from "@mui/material";
import { ErrorBoundary } from "react-error-boundary";
import type { SampleConfig } from "@/samples";
import { CodesandboxIcon } from "./CodesandboxIcon";
import { StackBlitzIcon } from "./StackBlitzIcon";
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
}: ActionPanelElementProps) => (
  <Tooltip title={disabled ? tooltipDisabledTitle : tooltipTitle} placement="bottom">
    <Link
      href={disabled ? undefined : href}
      target={disabled ? undefined : hrefTarget}
      rel={isExternal ? "noopener noreferrer" : undefined}
      color={disabled ? "textDisabled" : "secondary"}
    >
      {children}
    </Link>
  </Tooltip>
);

const ActionPanel: FC<ActionPanelProps> = ({
  sampleConfig: { github, codesandbox, stackblitz, terminal },
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
      <ActionPanelElement
        disabled={!terminal}
        tooltipTitle="Open in terminal"
        tooltipDisabledTitle="Terminal not available"
        href={terminal}
        isExternal={false}
      >
        <TableChart />
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
    <Card
      sx={{
        minWidth: 275,
        borderRadius: 3,
        height: { xs: 480, md: 575 },
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardHeader
        title={title}
        subheader={subTitle}
        action={<ActionPanel sampleConfig={sampleConfig} />}
      />
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        <ErrorBoundary fallbackRender={ErrorFallback}>{children}</ErrorBoundary>
      </CardContent>
    </Card>
  );
};

export { ChartWidgetCard };
