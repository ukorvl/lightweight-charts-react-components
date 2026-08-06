import { Page404 } from "@/pages/Page404";
import { ProgressBox } from "@/ui/ProgressBox";
import {
  getDefaultDocsLineId,
  isAvailableDocsLine,
  isKnownTopic,
  useDocsManifest,
} from "./docsApi";
import { DocsIndex } from "./DocsIndex";
import { DocsTopic } from "./DocsTopic";
import type { RouteComponentProps } from "wouter";

const DocsIndexRoute = () => <DocsIndex />;

const DocsSegmentRoute = ({ params }: RouteComponentProps<{ segment: string }>) => {
  const manifestState = useDocsManifest();
  const manifest = manifestState.data;

  if (manifestState.loading) {
    return <ProgressBox />;
  }

  if (!manifest) {
    return <DocsIndex />;
  }

  if (isAvailableDocsLine(manifest, params.segment)) {
    return <DocsIndex lineId={params.segment} />;
  }

  if (isKnownTopic(manifest, params.segment)) {
    const defaultLineId = getDefaultDocsLineId(manifest);

    return <DocsTopic lineId={defaultLineId} topicId={params.segment} />;
  }

  return <Page404 />;
};

const DocsVersionTopicRoute = ({
  params,
}: RouteComponentProps<{ segment: string; topic: string }>) => {
  const manifestState = useDocsManifest();
  const manifest = manifestState.data;

  if (manifestState.loading) {
    return <ProgressBox />;
  }

  if (
    manifest &&
    (!isAvailableDocsLine(manifest, params.segment) ||
      !isKnownTopic(manifest, params.topic))
  ) {
    return <Page404 />;
  }

  return <DocsTopic lineId={params.segment} topicId={params.topic} />;
};

export { DocsIndexRoute, DocsSegmentRoute, DocsVersionTopicRoute };
