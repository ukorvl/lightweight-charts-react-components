import { GitHub, TableChart } from "@mui/icons-material";
import { Card, CardContent, CardHeader, Stack, Link, Tooltip } from "@mui/material";
import { CodesandboxIcon } from "./CodesandboxIcon";
import { StackBlitzIcon } from "./StackBlitzIcon";
import type { FC, ReactNode } from "react";

type ChartWidgetCardProps = {
  title: string;
  subTitle?: string;
  children?: ReactNode;
} & AcitionPanelProps;

type AcitionPanelProps = {
  codeSanboxLink?: string;
  stackBlitzLink?: string;
  githubLink?: string;
  terminalLink?: string;
};

const ActionPanel: FC<AcitionPanelProps> = ({
  codeSanboxLink,
  stackBlitzLink,
  githubLink,
  terminalLink,
}) => {
  return (
    <Stack direction="row" spacing={1.5}>
      <Tooltip title="Open the source in GitHub" placement="bottom">
        <Link
          href={githubLink}
          target="_blank"
          rel="noopener noreferrer"
          color={githubLink ? "secondary" : "textDisabled"}
        >
          <GitHub />
        </Link>
      </Tooltip>
      <Tooltip title="Edit in CodeSandbox" placement="bottom">
        <Link
          href={codeSanboxLink}
          target="_blank"
          rel="noopener noreferrer"
          color={codeSanboxLink ? "secondary" : "textDisabled"}
        >
          <CodesandboxIcon />
        </Link>
      </Tooltip>
      <Tooltip title="Edit in StackBlitz" placement="bottom">
        <Link
          href={stackBlitzLink}
          target="_blank"
          rel="noopener noreferrer"
          color={stackBlitzLink ? "secondary" : "textDisabled"}
        >
          <StackBlitzIcon inheritViewBox />
        </Link>
      </Tooltip>
      <Tooltip title="Open in terminal" placement="bottom">
        <Link color={terminalLink ? "secondary" : "textDisabled"} href={terminalLink}>
          <TableChart />
        </Link>
      </Tooltip>
    </Stack>
  );
};

const ChartWidgetCard: FC<ChartWidgetCardProps> = ({
  children,
  title,
  subTitle,
  codeSanboxLink,
  stackBlitzLink,
  terminalLink,
  githubLink,
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
        action={
          <ActionPanel
            codeSanboxLink={codeSanboxLink}
            stackBlitzLink={stackBlitzLink}
            githubLink={githubLink}
            terminalLink={terminalLink}
          />
        }
      />
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
};

export { ChartWidgetCard };
