import { GitHub, TableChart } from "@mui/icons-material";
import {
  Card,
  CardContent,
  CardHeader,
  Stack,
  Link,
  Tooltip,
} from "@mui/material";
import { FC, ReactNode } from "react";
import { CodesandboxIcon } from "./CodesandboxIcon";

type ChartWidgetCardProps = {
  title: string;
  subTitle?: string;
  children?: ReactNode;
} & AcitionPanelProps;

type AcitionPanelProps = {
  codeSnippetLink?: string;
  githubLink: string;
};

const ActionPanel: FC<AcitionPanelProps> = ({ codeSnippetLink, githubLink }) => {
  return (
    <Stack direction="row" spacing={1.5}>
      <Tooltip title="Open the source in GitHub" placement="bottom">
        <Link
          href={githubLink}
          target="_blank"
          rel="noopener noreferrer"
          color="secondary"
        >
          <GitHub />
        </Link>
      </Tooltip>
      <Tooltip title="Edit in CodeSandbox" placement="bottom">
        <Link
          href={codeSnippetLink}
          target="_blank"
          rel="noopener noreferrer"
          color="textDisabled"
        >
          <CodesandboxIcon />
        </Link>
      </Tooltip>
      <Tooltip title="Open in terminal" placement="bottom">
        <Link
          href={codeSnippetLink}
          target="_blank"
          rel="noopener noreferrer"
          color="textDisabled"
        >
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
  codeSnippetLink,
  githubLink,
}) => {
  return (
    <Card sx={{ minWidth: 275, borderRadius: 3 }}>
      <CardHeader
        title={title}
        subheader={subTitle}
        action={<ActionPanel codeSnippetLink={codeSnippetLink} githubLink={githubLink} />}
      />
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export { ChartWidgetCard };
