import { GitHub, TableChart } from "@mui/icons-material";
import { Card, CardContent, CardHeader, Stack, Link, Tooltip } from "@mui/material";
import type { SampleConfig } from "@/samples";
import { CodesandboxIcon } from "./CodesandboxIcon";
import { StackBlitzIcon } from "./StackBlitzIcon";
import type { FC, ReactNode } from "react";

type ChartWidgetCardProps = {
  title: string;
  subTitle?: string;
  children?: ReactNode;
} & AcitionPanelProps;

type AcitionPanelProps = {
  sampleConfig: SampleConfig;
};

const ActionPanel: FC<AcitionPanelProps> = ({
  sampleConfig: { github, codesandbox, stackblitz, terminal },
}) => {
  return (
    <Stack direction="row" spacing={1.5}>
      <Tooltip title="Open the source in GitHub" placement="bottom">
        <Link
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          color={github ? "secondary" : "textDisabled"}
        >
          <GitHub />
        </Link>
      </Tooltip>
      <Tooltip title="View in CodeSandbox" placement="bottom">
        <Link
          href={codesandbox}
          target="_blank"
          rel="noopener noreferrer"
          color={codesandbox ? "secondary" : "textDisabled"}
        >
          <CodesandboxIcon />
        </Link>
      </Tooltip>
      <Tooltip title="Edit in StackBlitz" placement="bottom">
        <Link
          href={stackblitz}
          target="_blank"
          rel="noopener noreferrer"
          color={stackblitz ? "secondary" : "textDisabled"}
        >
          <StackBlitzIcon inheritViewBox />
        </Link>
      </Tooltip>
      <Tooltip title="Open in terminal" placement="bottom">
        <Link color={terminal ? "secondary" : "textDisabled"} href={terminal}>
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
        {children}
      </CardContent>
    </Card>
  );
};

export { ChartWidgetCard };
