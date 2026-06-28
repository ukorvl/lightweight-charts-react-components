import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

type DocsTopicRegistryEntry = {
  id: string;
};

type DocsLineManifest = {
  id: string;
  topics: string[];
};

type DocsVersionsManifest = {
  latestDocsLine: string;
  lines: Array<{
    id: string;
    topics: string[];
  }>;
};

const repoRoot = path.resolve(__dirname, "..", "..");
const topicRegistry = JSON.parse(
  readFileSync(path.join(repoRoot, "docs", "topic-registry.json"), "utf8")
) as DocsTopicRegistryEntry[];
const currentManifest = JSON.parse(
  readFileSync(path.join(repoRoot, "docs", "current", "manifest.json"), "utf8")
) as DocsLineManifest;
const versionsManifest = JSON.parse(
  readFileSync(path.join(repoRoot, "docs", "versions", "manifest.json"), "utf8")
) as DocsVersionsManifest;

const topicIds = new Set(topicRegistry.map(topic => topic.id));

describe("docs manifests", () => {
  it("keeps every current topic in the shared registry", () => {
    for (const topicId of currentManifest.topics) {
      expect(topicIds.has(topicId)).toBe(true);
    }
  });

  it("keeps snapshot topic files in sync with each released line", () => {
    for (const line of versionsManifest.lines) {
      const lineManifest = JSON.parse(
        readFileSync(
          path.join(repoRoot, "docs", "versions", line.id, "manifest.json"),
          "utf8"
        )
      ) as DocsLineManifest;

      expect(lineManifest.topics).toEqual(line.topics);

      for (const topicId of lineManifest.topics) {
        expect(topicIds.has(topicId)).toBe(true);
        expect(
          existsSync(
            path.join(repoRoot, "docs", "versions", line.id, "topics", `${topicId}.mdx`)
          )
        ).toBe(true);
      }
    }
  });

  it("shows the pane primitive topic only in v2.3", () => {
    const v23 = versionsManifest.lines.find(line => line.id === "v2.3");
    const v22 = versionsManifest.lines.find(line => line.id === "v2.2");

    expect(v23?.topics).toContain("pane-primitives");
    expect(v22?.topics).not.toContain("pane-primitives");
  });
});
