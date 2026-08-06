import ArrowForward from "@mui/icons-material/ArrowForward";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as WouterLink, useLocation } from "wouter";
import { ProgressBox } from "@/ui/ProgressBox";
import {
  findReleasedLine,
  getDefaultDocsLineId,
  getIndexRoutePath,
  getTopicRoutePath,
  getVisibleDocsLines,
  previewEnabled,
  useDocsLine,
  useDocsManifest,
} from "./docsApi";
import { DocsLayout } from "./DocsLayout";

type DocsIndexProps = {
  lineId?: string;
};

const DocsIndex = ({ lineId }: DocsIndexProps) => {
  const [, navigate] = useLocation();
  const manifestState = useDocsManifest();
  const manifest = manifestState.data;
  const resolvedLineId = manifest
    ? (lineId ?? getDefaultDocsLineId(manifest))
    : undefined;
  const lineState = useDocsLine(resolvedLineId);

  if (manifestState.loading || lineState.loading || !manifest || !lineState.data) {
    return <ProgressBox />;
  }

  if (manifestState.error || lineState.error) {
    return (
      <Typography color="error">
        {(manifestState.error ?? lineState.error)?.message ?? "Failed to load docs"}
      </Typography>
    );
  }

  const activeLineId = resolvedLineId ?? getDefaultDocsLineId(manifest);
  const releasedLine = findReleasedLine(manifest, activeLineId);
  const activeLineTitle =
    activeLineId === manifest.previewLine && previewEnabled
      ? "Current docs preview"
      : (releasedLine?.title ?? lineState.data.title);

  return (
    <DocsLayout
      manifest={manifest}
      activeLineId={activeLineId}
      lines={getVisibleDocsLines(manifest)}
      onLineChange={nextLineId =>
        navigate(getIndexRoutePath({ lineId: nextLineId, manifest }))
      }
      title="Docs"
      description={`${activeLineTitle}. Browse conceptual topics and drill into the generated API reference for each public export group.`}
    >
      <Stack spacing={3} useFlexGap>
        {lineState.data.topics.map(topic => (
          <Card key={topic.id} variant="outlined">
            <CardActionArea
              component={WouterLink}
              href={getTopicRoutePath({
                lineId: activeLineId,
                topicId: topic.id,
                manifest,
              })}
            >
              <CardContent>
                <Stack spacing={1.5} useFlexGap>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography variant="h5" component="h2">
                      {topic.title}
                    </Typography>
                    <ArrowForward color="info" />
                  </Stack>
                  <Typography color="text.secondary">{topic.description}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    Exports: {topic.exports.join(", ")}
                  </Typography>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
        <Typography color="text.secondary" variant="body2">
          The generated API sections document the wrapper-owned public surface and link
          out to upstream TradingView docs for reused Lightweight Charts types.
        </Typography>
        <Link
          href="https://tradingview.github.io/lightweight-charts/docs"
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
        >
          Open upstream Lightweight Charts documentation
        </Link>
      </Stack>
    </DocsLayout>
  );
};

export { DocsIndex };
