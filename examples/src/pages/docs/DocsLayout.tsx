import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as WouterLink } from "wouter";
import { gradientLinkStyles } from "@/common/styles";
import { getIndexRoutePath, getTopicRoutePath } from "./docsApi";
import type { DocsSiteManifest, DocsVisibleLine } from "./docsTypes";
import type { ReactNode } from "react";

type DocsLayoutProps = {
  manifest: DocsSiteManifest;
  activeLineId: string;
  activeTopicId?: string;
  lines: DocsVisibleLine[];
  onLineChange: (lineId: string) => void;
  title: string;
  description: string;
  children: ReactNode;
};

const DocsLayout = ({
  manifest,
  activeLineId,
  activeTopicId,
  lines,
  onLineChange,
  title,
  description,
  children,
}: DocsLayoutProps) => {
  return (
    <Stack
      component="main"
      spacing={4}
      useFlexGap
      sx={{
        marginTop: 4,
        marginBottom: 12,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "flex-end" }}
        gap={3}
      >
        <Stack spacing={1} useFlexGap>
          <Typography variant="overline" color="text.secondary">
            Documentation
          </Typography>
          <Typography variant="h2" component="h1">
            {title}
          </Typography>
          <Typography maxWidth={760} color="text.secondary">
            {description}
          </Typography>
        </Stack>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="docs-version-label">Docs version</InputLabel>
          <Select
            labelId="docs-version-label"
            id="docs-version"
            value={activeLineId}
            label="Docs version"
            onChange={event => onLineChange(event.target.value)}
          >
            {lines.map(line => (
              <MenuItem key={line.id} value={line.id}>
                {line.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      <Stack
        direction="row"
        flexWrap="wrap"
        gap={2}
        useFlexGap
        aria-label="Documentation topics"
      >
        <Link
          component={WouterLink}
          href={getIndexRoutePath({
            lineId: activeLineId,
            manifest,
          })}
          sx={{
            ...gradientLinkStyles,
            opacity: activeTopicId ? 0.8 : 1,
          }}
        >
          Overview
        </Link>
        {manifest.topicRegistry.map(topic => (
          <Link
            key={topic.id}
            component={WouterLink}
            href={getTopicRoutePath({
              lineId: activeLineId,
              topicId: topic.id,
              manifest,
            })}
            sx={{
              ...gradientLinkStyles,
              opacity: activeTopicId === topic.id ? 1 : 0.8,
            }}
          >
            {topic.title}
          </Link>
        ))}
      </Stack>
      <Box>{children}</Box>
    </Stack>
  );
};

export { DocsLayout };
