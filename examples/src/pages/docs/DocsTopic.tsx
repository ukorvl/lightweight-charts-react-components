import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useLocation } from "wouter";
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

type DocsTopicProps = {
  lineId?: string;
  topicId: string;
};

const richContentSx = {
  "& p": {
    color: "text.secondary",
    lineHeight: 1.7,
  },
  "& a": {
    color: "info.main",
  },
  "& code": {
    fontFamily: '"Roboto Mono", monospace',
  },
  "& figure": {
    margin: 0,
  },
  "& figcaption": {
    marginBottom: 1,
    color: "text.secondary",
    fontWeight: "bold",
  },
  "& pre": {
    overflowX: "auto",
    padding: 2,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
};

const DocsTopic = ({ lineId, topicId }: DocsTopicProps) => {
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
  const topic = lineState.data.topics.find(item => item.id === topicId);
  const releasedLine = findReleasedLine(manifest, activeLineId);
  const activeLineTitle =
    activeLineId === manifest.previewLine && previewEnabled
      ? "Current docs preview"
      : (releasedLine?.title ?? lineState.data.title);
  const registryTopic = manifest.topicRegistry.find(item => item.id === topicId);

  return (
    <DocsLayout
      manifest={manifest}
      activeLineId={activeLineId}
      activeTopicId={topicId}
      lines={getVisibleDocsLines(manifest)}
      onLineChange={nextLineId =>
        navigate(
          getTopicRoutePath({
            lineId: nextLineId,
            topicId,
            manifest,
          })
        )
      }
      title={topic?.title ?? registryTopic?.title ?? "Documentation"}
      description={topic?.description ?? activeLineTitle}
    >
      {!topic ? (
        <Paper variant="outlined" sx={{ padding: 3 }}>
          <Stack spacing={2} useFlexGap>
            <Typography variant="h5">Not available in this version</Typography>
            <Typography color="text.secondary">
              The <code>{topicId}</code> topic is not part of the{" "}
              <code>{activeLineId}</code> docs line.
            </Typography>
            <Stack direction="row" gap={2} useFlexGap flexWrap="wrap">
              <Link
                underline="hover"
                onClick={() =>
                  navigate(
                    getIndexRoutePath({
                      lineId: activeLineId,
                      manifest,
                    })
                  )
                }
                sx={{ cursor: "pointer" }}
              >
                Open this version overview
              </Link>
              <Link
                underline="hover"
                onClick={() =>
                  navigate(
                    getTopicRoutePath({
                      lineId: manifest.latestDocsLine,
                      topicId,
                      manifest,
                    })
                  )
                }
                sx={{ cursor: "pointer" }}
              >
                Open the latest docs topic
              </Link>
            </Stack>
          </Stack>
        </Paper>
      ) : (
        <Stack spacing={3} useFlexGap>
          <Paper variant="outlined" sx={{ padding: 3 }}>
            <Box sx={richContentSx} dangerouslySetInnerHTML={{ __html: topic.html }} />
          </Paper>
          <Stack spacing={2} useFlexGap>
            <Typography variant="h4" component="h2">
              API Reference
            </Typography>
            {topic.api.map(item => (
              <Paper key={item.name} variant="outlined" sx={{ padding: 3 }}>
                <Stack spacing={2} useFlexGap>
                  <Stack spacing={0.5} useFlexGap>
                    <Typography variant="h5" component="h3">
                      {item.name}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      {item.kind}
                      {item.aliasOf ? ` · aliases ${item.aliasOf}` : ""}
                    </Typography>
                  </Stack>
                  {item.summary ? (
                    <Typography color="text.secondary">{item.summary}</Typography>
                  ) : null}
                  {item.type ? (
                    <Box component="pre" sx={{ ...richContentSx["& pre"], margin: 0 }}>
                      <code>{item.type}</code>
                    </Box>
                  ) : null}
                  {item.properties.length > 0 ? (
                    <Table size="small" aria-label={`${item.name} properties`}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Description</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {item.properties.map(property => (
                          <TableRow key={property.name}>
                            <TableCell>
                              <code>
                                {property.name}
                                {property.optional ? "?" : ""}
                              </code>
                            </TableCell>
                            <TableCell>
                              <code>{property.type ?? "unknown"}</code>
                            </TableCell>
                            <TableCell>{property.summary || " "}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : null}
                  {item.signatures.length > 0 ? (
                    <Stack spacing={1} useFlexGap>
                      <Typography variant="subtitle1">Signatures</Typography>
                      {item.signatures.map(signature => (
                        <Paper
                          key={`${item.name}-${signature.returns ?? "void"}-${signature.parameters.map(parameter => parameter.name).join("-")}`}
                          variant="outlined"
                          sx={{ padding: 2 }}
                        >
                          <Stack spacing={1} useFlexGap>
                            {signature.summary ? (
                              <Typography color="text.secondary">
                                {signature.summary}
                              </Typography>
                            ) : null}
                            {signature.parameters.length > 0 ? (
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Parameter</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Description</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {signature.parameters.map(parameter => (
                                    <TableRow key={parameter.name}>
                                      <TableCell>
                                        <code>
                                          {parameter.name}
                                          {parameter.optional ? "?" : ""}
                                        </code>
                                      </TableCell>
                                      <TableCell>
                                        <code>{parameter.type ?? "unknown"}</code>
                                      </TableCell>
                                      <TableCell>{parameter.summary || " "}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : null}
                            {signature.returns ? (
                              <Typography color="text.secondary" variant="body2">
                                Returns: <code>{signature.returns}</code>
                              </Typography>
                            ) : null}
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  ) : null}
                  {item.examples.length > 0 ? (
                    <Stack spacing={1} useFlexGap>
                      <Typography variant="subtitle1">Examples</Typography>
                      {item.examples.map(example => (
                        <Box
                          key={example}
                          component="pre"
                          sx={{ ...richContentSx["& pre"], margin: 0 }}
                        >
                          <code>{example}</code>
                        </Box>
                      ))}
                    </Stack>
                  ) : null}
                  {item.see.length > 0 ? (
                    <Stack spacing={0.5} useFlexGap>
                      <Typography variant="subtitle1">Related links</Typography>
                      {item.see.map(link => (
                        <Link
                          key={`${item.name}-${link.href}`}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </Stack>
                  ) : null}
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Stack>
      )}
    </DocsLayout>
  );
};

export { DocsTopic };
