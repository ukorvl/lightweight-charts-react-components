import { useEffect, useState } from "react";
import type { DocsLinePayload, DocsSiteManifest, DocsVisibleLine } from "./docsTypes";

type AsyncState<T> = {
  data?: T;
  error?: Error;
  loading: boolean;
};

const lineCache = new Map<string, Promise<DocsLinePayload>>();
let manifestPromise: Promise<DocsSiteManifest> | undefined;

const basePath = import.meta.env.VITE_BASE_URL?.replace(/\/$/, "") ?? "";
const docsDataBasePath = `${basePath}/docs-data`;
const previewEnabled = import.meta.env.DEV;

const fetchJson = async <T>(assetPath: string): Promise<T> => {
  const response = await fetch(assetPath);

  if (!response.ok) {
    throw new Error(`Failed to load docs asset: ${assetPath} (${response.status})`);
  }

  return (await response.json()) as T;
};

const getDocsManifest = () => {
  manifestPromise ??= fetchJson<DocsSiteManifest>(`${docsDataBasePath}/manifest.json`);

  return manifestPromise;
};

const getDocsLine = (lineId: string) => {
  const cached = lineCache.get(lineId);

  if (cached) {
    return cached;
  }

  const promise = fetchJson<DocsLinePayload>(`${docsDataBasePath}/lines/${lineId}.json`);
  lineCache.set(lineId, promise);

  return promise;
};

const useAsyncResource = <T>(
  loader: (() => Promise<T>) | undefined,
  deps: readonly unknown[]
): AsyncState<T> => {
  const [state, setState] = useState<AsyncState<T>>({
    loading: Boolean(loader),
  });

  useEffect(() => {
    if (!loader) {
      setState({
        loading: false,
      });

      return;
    }

    let disposed = false;

    setState({
      loading: true,
    });

    loader()
      .then(data => {
        if (disposed) {
          return;
        }

        setState({
          data,
          loading: false,
        });
      })
      .catch((error: unknown) => {
        if (disposed) {
          return;
        }

        setState({
          error: error instanceof Error ? error : new Error(String(error)),
          loading: false,
        });
      });

    return () => {
      disposed = true;
    };
  }, deps);

  return state;
};

const getDefaultDocsLineId = (manifest: DocsSiteManifest) =>
  previewEnabled ? manifest.previewLine : manifest.latestDocsLine;

const getVisibleDocsLines = (manifest: DocsSiteManifest): DocsVisibleLine[] => {
  const lines = manifest.releasedLines.map(line => ({
    id: line.id,
    label: line.label,
    title: line.title,
    status: line.status,
  }));

  if (previewEnabled) {
    return [
      {
        id: manifest.previewLine,
        label: "Current",
        title: "Current docs preview",
        status: "preview",
      },
      ...lines,
    ];
  }

  return lines;
};

const getTopicRoutePath = ({
  lineId,
  topicId,
  manifest,
}: {
  lineId: string;
  topicId: string;
  manifest: DocsSiteManifest;
}) => {
  const defaultLineId = getDefaultDocsLineId(manifest);

  if (lineId === defaultLineId) {
    return `/docs/${topicId}`;
  }

  return `/docs/${lineId}/${topicId}`;
};

const getIndexRoutePath = ({
  lineId,
  manifest,
}: {
  lineId: string;
  manifest: DocsSiteManifest;
}) => {
  const defaultLineId = getDefaultDocsLineId(manifest);

  if (lineId === defaultLineId) {
    return "/docs";
  }

  return `/docs/${lineId}`;
};

const findReleasedLine = (manifest: DocsSiteManifest, lineId: string) =>
  manifest.releasedLines.find(line => line.id === lineId);

const isAvailableDocsLine = (manifest: DocsSiteManifest, lineId: string) =>
  Boolean(findReleasedLine(manifest, lineId)) ||
  (previewEnabled && lineId === manifest.previewLine);

const isKnownTopic = (manifest: DocsSiteManifest, topicId: string) =>
  manifest.topicRegistry.some(topic => topic.id === topicId);

const useDocsManifest = () => useAsyncResource(getDocsManifest, []);

const useDocsLine = (lineId: string | undefined) =>
  useAsyncResource(lineId ? () => getDocsLine(lineId) : undefined, [lineId]);

export {
  docsDataBasePath,
  findReleasedLine,
  getDefaultDocsLineId,
  getIndexRoutePath,
  getTopicRoutePath,
  getVisibleDocsLines,
  isAvailableDocsLine,
  isKnownTopic,
  previewEnabled,
  useDocsLine,
  useDocsManifest,
};
