export type DocsTopicRegistryEntry = {
  id: string;
  title: string;
  summary: string;
  exports: string[];
  order: number;
};

export type DocsReleasedLine = {
  id: string;
  label: string;
  title: string;
  status: "latest" | "supported";
  packageVersionRange: string;
  topics: string[];
};

export type DocsSiteManifest = {
  latestDocsLine: string;
  previewLine: string;
  topicRegistry: DocsTopicRegistryEntry[];
  releasedLines: DocsReleasedLine[];
  packageVersionToDocsLine: Array<{
    range: string;
    docsLine: string;
  }>;
};

export type DocsApiProperty = {
  name: string;
  kind: string;
  summary: string;
  type?: string;
  optional?: boolean;
};

export type DocsApiSignature = {
  summary: string;
  parameters: Array<{
    name: string;
    type?: string;
    summary: string;
    optional?: boolean;
  }>;
  returns?: string;
};

export type DocsApiItem = {
  name: string;
  kind: string;
  summary: string;
  type?: string;
  properties: DocsApiProperty[];
  signatures: DocsApiSignature[];
  see: Array<{
    href: string;
    label: string;
  }>;
  examples: string[];
  aliasOf?: string;
};

export type DocsTopicPayload = {
  id: string;
  title: string;
  summary: string;
  description: string;
  html: string;
  exports: string[];
  api: DocsApiItem[];
};

export type DocsLinePayload = {
  id: string;
  title: string;
  status: string;
  description: string;
  packageVersionRange?: string;
  generatedAt: string;
  topics: DocsTopicPayload[];
};

export type DocsVisibleLine = {
  id: string;
  label: string;
  title: string;
  status: "latest" | "supported" | "preview";
};
