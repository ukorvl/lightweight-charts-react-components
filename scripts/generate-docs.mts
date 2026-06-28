#!/usr/bin/env node
/* eslint-disable no-console */

import { execFile as execFileCallback } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { evaluate } from "@mdx-js/mdx";
import matter from "gray-matter";
import { createElement } from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { Application, ReflectionKind } from "typedoc";
import type {
  Comment,
  DeclarationReflection,
  ProjectReflection,
  ReflectionKind as ReflectionKindValue,
  SignatureReflection,
} from "typedoc";

type TopicRegistryEntry = {
  id: string;
  title: string;
  summary: string;
  exports: string[];
  order: number;
};

type DocsLineManifest = {
  id: string;
  title: string;
  status: "unreleased" | "released";
  description: string;
  apiSource: string;
  topics: string[];
  packageVersionRange?: string;
};

type ReleasedLineRecord = {
  id: string;
  label: string;
  title: string;
  status: "latest" | "supported";
  packageVersionRange: string;
  topics: string[];
};

type VersionsManifest = {
  latestDocsLine: string;
  lines: ReleasedLineRecord[];
  packageVersionToDocsLine: Array<{
    range: string;
    docsLine: string;
  }>;
};

type DocsLineDefinition = {
  sourceDir: string;
  manifest: DocsLineManifest;
  lineType: "current" | "released";
};

type NormalizedApiProperty = {
  name: string;
  kind: string;
  summary: string;
  type?: string;
  optional?: boolean;
};

type NormalizedApiSignature = {
  summary: string;
  parameters: Array<{
    name: string;
    type?: string;
    summary: string;
    optional?: boolean;
  }>;
  returns?: string;
};

type NormalizedApiItem = {
  name: string;
  kind: string;
  summary: string;
  type?: string;
  properties: NormalizedApiProperty[];
  signatures: NormalizedApiSignature[];
  see: Array<{ href: string; label: string }>;
  examples: string[];
  aliasOf?: string;
};

type GeneratedTopicPayload = {
  id: string;
  title: string;
  summary: string;
  description: string;
  html: string;
  exports: string[];
  api: NormalizedApiItem[];
};

type GeneratedRuntimePayload = {
  id: string;
  title: string;
  status: string;
  description: string;
  packageVersionRange?: string;
  generatedAt: string;
  topics: GeneratedTopicPayload[];
};

type SiteManifest = {
  latestDocsLine: string;
  previewLine: string;
  topicRegistry: TopicRegistryEntry[];
  releasedLines: ReleasedLineRecord[];
  packageVersionToDocsLine: VersionsManifest["packageVersionToDocsLine"];
};

const execFile = promisify(execFileCallback);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const docsRoot = path.join(repoRoot, "docs");
const currentDocsRoot = path.join(docsRoot, "current");
const versionsRoot = path.join(docsRoot, "versions");
const examplesDocsDataRoot = path.join(repoRoot, "examples", "public", "docs-data");
const lineOutputRoot = path.join(examplesDocsDataRoot, "lines");

const readJson = async <T>(filePath: string): Promise<T> =>
  JSON.parse(await readFile(filePath, "utf8")) as T;

const writeJson = async (filePath: string, value: unknown) => {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
};

const commentToText = (comment?: Comment) =>
  comment?.summary?.map(fragment => fragment.text).join("").trim() ?? "";

const tagContentToText = (comment?: Comment, tagName?: string) =>
  (comment?.blockTags ?? [])
    .filter(tag => tag.tag === tagName)
    .flatMap(tag => tag.content)
    .map(fragment => fragment.text)
    .join("")
    .trim();

const extractSeeLinks = (comment?: Comment) =>
  (comment?.blockTags ?? [])
    .filter(tag => tag.tag === "@see")
    .flatMap(tag =>
      tag.content
        .filter(
          fragment =>
            fragment.kind === "inline-tag" &&
            fragment.tag === "@link" &&
            typeof fragment.target === "string"
        )
        .map(fragment => ({
          href: fragment.target as string,
          label: fragment.text?.trim() || (fragment.target as string),
        }))
    );

const extractExamples = (comment?: Comment) =>
  (comment?.blockTags ?? [])
    .filter(tag => tag.tag === "@example")
    .flatMap(tag =>
      tag.content
        .filter(fragment => fragment.kind === "code")
        .map(fragment => fragment.text.trim())
    );

const getKindName = (kind: ReflectionKindValue) => ReflectionKind[kind] ?? "Unknown";

const resolveProperties = (
  reflection: DeclarationReflection,
  seenIds = new Set<number>()
): NormalizedApiProperty[] => {
  if (seenIds.has(reflection.id)) {
    return [];
  }

  seenIds.add(reflection.id);

  if (reflection.children?.length) {
    return reflection.children.map(child => ({
      name: child.name,
      kind: getKindName(child.kind),
      summary: commentToText(child.comment),
      type: child.type?.toString(),
      optional: child.flags.isOptional,
    }));
  }

  const reflectionType = reflection.type;

  if (reflectionType && "reflection" in reflectionType && reflectionType.reflection) {
    return resolveProperties(reflectionType.reflection as DeclarationReflection, seenIds);
  }

  if (reflectionType && "declaration" in reflectionType && reflectionType.declaration) {
    return (reflectionType.declaration.children ?? []).map(child => ({
      name: child.name,
      kind: getKindName(child.kind),
      summary: commentToText(child.comment),
      type: child.type?.toString(),
      optional: child.flags.isOptional,
    }));
  }

  return [];
};

const normalizeSignature = (signature: SignatureReflection): NormalizedApiSignature => ({
  summary: commentToText(signature.comment) || tagContentToText(signature.comment, "@returns"),
  parameters: (signature.parameters ?? []).map(parameter => ({
    name: parameter.name,
    type: parameter.type?.toString(),
    summary: commentToText(parameter.comment),
    optional: parameter.flags.isOptional,
  })),
  returns: signature.type?.toString(),
});

const normalizeReflection = (reflection: DeclarationReflection): NormalizedApiItem => {
  const aliasTarget =
    reflection.type && "reflection" in reflection.type
      ? (reflection.type.reflection as DeclarationReflection | undefined)
      : undefined;

  return {
    name: reflection.name,
    kind: getKindName(reflection.kind),
    summary: commentToText(reflection.comment),
    type: reflection.type?.toString(),
    properties: resolveProperties(reflection),
    signatures: (reflection.signatures ?? []).map(normalizeSignature),
    see: extractSeeLinks(reflection.comment),
    examples: extractExamples(reflection.comment),
    aliasOf: aliasTarget?.name,
  };
};

const findExportReflection = (
  project: ProjectReflection,
  exportName: string
): DeclarationReflection | undefined =>
  (project.children ?? []).find(
    child => child.name === exportName
  ) as DeclarationReflection | undefined;

const renderGuideHtml = async (
  sourceDir: string,
  topicId: string,
  snippets: Map<string, string>
) => {
  const guidePath = path.join(sourceDir, "topics", `${topicId}.mdx`);
  const fileContents = await readFile(guidePath, "utf8");
  const { data, content } = matter(fileContents);

  const evaluated = await evaluate(content, {
    ...jsxRuntime,
    baseUrl: import.meta.url,
    development: false,
  });

  const Content = evaluated.default;

  const html = renderToStaticMarkup(
    createElement(Content, {
      components: {
        CodeExample: ({
          path: snippetPath,
          title,
        }: {
          path: string;
          title?: string;
        }) => {
          const source = snippets.get(snippetPath);

          if (!source) {
            throw new Error(
              `Snippet "${snippetPath}" referenced from "${guidePath}" could not be found`
            );
          }

          return createElement(
            "figure",
            {
              className: "docs-code-example",
              "data-snippet-path": snippetPath,
            },
            title
              ? createElement("figcaption", { className: "docs-code-example__title" }, title)
              : null,
            createElement(
              "pre",
              { className: "docs-code-example__body" },
              createElement("code", { className: "language-tsx" }, source.trim())
            )
          );
        },
      },
    })
  );

  return {
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    html,
    rawSource: fileContents,
  };
};

const loadSnippets = async (sourceDir: string) => {
  const snippetDir = path.join(sourceDir, "snippets");
  const snippetFiles = await readdir(snippetDir);
  const entries = await Promise.all(
    snippetFiles
      .filter(fileName => fileName.endsWith(".tsx"))
      .map(async fileName => [
        fileName,
        await readFile(path.join(snippetDir, fileName), "utf8"),
      ] as const)
  );

  return new Map(entries);
};

const createApiSourceArchive = async (ref: string) => {
  const tempDir = await mkdtemp(
    path.join(os.tmpdir(), `lwcrc-docs-${ref.replace(/[^\w.-]/g, "-")}-`)
  );
  const tarPath = path.join(tempDir, "source.tar");

  const { stdout } = await execFile("git", ["archive", "--format=tar", ref], {
    cwd: repoRoot,
    encoding: "buffer",
    maxBuffer: 1024 * 1024 * 32,
  });
  await writeFile(tarPath, stdout);
  await execFile("tar", ["-xf", tarPath, "-C", tempDir], {
    cwd: repoRoot,
  });
  await rm(tarPath, { force: true });
  await symlink(path.join(repoRoot, "node_modules"), path.join(tempDir, "node_modules"));

  return {
    rootDir: tempDir,
    async cleanup() {
      await rm(tempDir, { recursive: true, force: true });
    },
  };
};

const prepareApiSource = async (apiSource: string) => {
  if (apiSource === "workspace") {
    return {
      rootDir: repoRoot,
      cleanup: async () => {},
    };
  }

  if (apiSource.startsWith("git:")) {
    return createApiSourceArchive(apiSource.slice("git:".length));
  }

  throw new Error(`Unsupported docs apiSource "${apiSource}"`);
};

const buildTypedocProject = async (sourceRoot: string) => {
  const entryPoint = path.join(sourceRoot, "lib", "src", "index.ts");
  const tsconfig = path.join(sourceRoot, "lib", "tsconfig.json");
  const app = await Application.bootstrapWithPlugins({
    entryPoints: [entryPoint],
    tsconfig,
    exclude: ["**/*.test.ts", "**/*.test.tsx", "**/tests/**/*"],
    plugin: [],
  });
  const project = await app.convert();

  if (!project) {
    throw new Error(`TypeDoc could not convert entry point at ${entryPoint}`);
  }

  return {
    app,
    project,
  };
};

const buildRuntimePayload = async (
  line: DocsLineDefinition,
  topicRegistry: TopicRegistryEntry[],
  project: ProjectReflection
): Promise<GeneratedRuntimePayload> => {
  const snippets = await loadSnippets(line.sourceDir);
  const topics: GeneratedTopicPayload[] = [];

  for (const topicId of line.manifest.topics) {
    const registryTopic = topicRegistry.find(topic => topic.id === topicId);

    if (!registryTopic) {
      throw new Error(
        `Topic "${topicId}" from ${path.join(line.sourceDir, "manifest.json")} is not declared in docs/topic-registry.json`
      );
    }

    const guide = await renderGuideHtml(line.sourceDir, topicId, snippets);
    const api = registryTopic.exports.map(exportName => {
      const reflection = findExportReflection(project, exportName);

      if (!reflection) {
        throw new Error(
          `Export "${exportName}" declared for topic "${topicId}" was not found in the TypeDoc project for line "${line.manifest.id}"`
        );
      }

      return normalizeReflection(reflection);
    });

    topics.push({
      id: registryTopic.id,
      title: guide.title || registryTopic.title,
      summary: registryTopic.summary,
      description: guide.description,
      html: guide.html,
      exports: registryTopic.exports,
      api,
    });
  }

  topics.sort((left, right) => {
    const leftOrder = topicRegistry.find(topic => topic.id === left.id)?.order ?? 0;
    const rightOrder = topicRegistry.find(topic => topic.id === right.id)?.order ?? 0;

    return leftOrder - rightOrder;
  });

  return {
    id: line.manifest.id,
    title: line.manifest.title,
    status: line.manifest.status,
    description: line.manifest.description,
    packageVersionRange: line.manifest.packageVersionRange,
    generatedAt: new Date().toISOString(),
    topics,
  };
};

const writeLineOutputs = async (
  line: DocsLineDefinition,
  runtimePayload: GeneratedRuntimePayload,
  typedocProjectObject: unknown
) => {
  await writeJson(path.join(line.sourceDir, "generated", "runtime.json"), runtimePayload);
  await writeJson(path.join(line.sourceDir, "generated", "typedoc.json"), typedocProjectObject);
  await writeJson(path.join(lineOutputRoot, `${line.manifest.id}.json`), runtimePayload);
};

const main = async () => {
  const topicRegistry = await readJson<TopicRegistryEntry[]>(
    path.join(docsRoot, "topic-registry.json")
  );
  const releasedVersionsManifest = await readJson<VersionsManifest>(
    path.join(versionsRoot, "manifest.json")
  );
  const currentManifest = await readJson<DocsLineManifest>(
    path.join(currentDocsRoot, "manifest.json")
  );

  const releasedLines = await Promise.all(
    releasedVersionsManifest.lines.map(async lineRecord => ({
      sourceDir: path.join(versionsRoot, lineRecord.id),
      manifest: await readJson<DocsLineManifest>(
        path.join(versionsRoot, lineRecord.id, "manifest.json")
      ),
      lineType: "released" as const,
    }))
  );

  const allLines: DocsLineDefinition[] = [
    {
      sourceDir: currentDocsRoot,
      manifest: currentManifest,
      lineType: "current",
    },
    ...releasedLines,
  ];

  await mkdir(lineOutputRoot, { recursive: true });

  for (const line of allLines) {
    const apiSource = await prepareApiSource(line.manifest.apiSource);

    try {
      const { app, project } = await buildTypedocProject(apiSource.rootDir);
      const runtimePayload = await buildRuntimePayload(line, topicRegistry, project);
      const typedocProjectObject = app.serializer.projectToObject(project, apiSource.rootDir);

      await writeLineOutputs(line, runtimePayload, typedocProjectObject);
    } finally {
      await apiSource.cleanup();
    }
  }

  const siteManifest: SiteManifest = {
    latestDocsLine: releasedVersionsManifest.latestDocsLine,
    previewLine: currentManifest.id,
    topicRegistry,
    releasedLines: releasedVersionsManifest.lines,
    packageVersionToDocsLine: releasedVersionsManifest.packageVersionToDocsLine,
  };

  await writeJson(path.join(examplesDocsDataRoot, "manifest.json"), siteManifest);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
