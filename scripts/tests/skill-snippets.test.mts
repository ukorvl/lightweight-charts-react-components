import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createTempDir } from "./test-helpers.mts";
import { checkTypes, extractSnippets, parseManifest } from "../skill-snippets.mts";

describe("skill snippet coverage", () => {
  it("includes typed fences with metadata rather than silently skipping them", () => {
    const snippets = extractSnippets(
      { "SKILL.md": "```tsx title=App\nexport const App = () => <div />;\n```" },
      parseManifest({ "SKILL.md": ["App.tsx"] })
    );
    expect(snippets[0].file).toBe("App.tsx");
  });
  it("extracts unmodified TS and TSX modules with their source locations", () => {
    const snippets = extractSnippets(
      {
        "references/live.md":
          "# Live\n\n```ts\nexport const value = 1;\n```\n\n```tsx\nexport const App = () => <div />;\n```",
      },
      { "references/live.md": ["data.ts", "App.tsx"] }
    );
    expect(snippets).toEqual([
      {
        source: "references/live.md",
        line: 4,
        file: "data.ts",
        code: "export const value = 1;\n",
      },
      {
        source: "references/live.md",
        line: 8,
        file: "App.tsx",
        code: "export const App = () => <div />;\n",
      },
    ]);
  });
  it("fails for new unregistered blocks, removed documents, and wrong extensions", () => {
    expect(() =>
      extractSnippets({ "SKILL.md": "```tsx\nexport const App = 1;\n```" }, {})
    ).toThrow("registered");
    expect(() => extractSnippets({}, { "references/missing.md": ["App.tsx"] })).toThrow(
      "Missing"
    );
    expect(() =>
      extractSnippets(
        { "SKILL.md": "```ts\nexport const value = 1;\n```" },
        { "SKILL.md": ["App.tsx"] }
      )
    ).toThrow("language");
    expect(() => extractSnippets({ "README.md": "```sh\nnpm install\n```" }, {})).toThrow(
      "No TypeScript"
    );
  });
  it("rejects path traversal and filename collisions before writing files", () => {
    expect(() => parseManifest({ "../outside.md": ["App.tsx"] })).toThrow();
    expect(() => parseManifest({ "references/live.md": ["../outside.tsx"] })).toThrow();
    expect(() =>
      parseManifest({
        "references/live.md": ["App.tsx"],
        "references/other.md": ["App.tsx"],
      })
    ).toThrow("duplicate");
    expect(() => parseManifest({ "references/live.md": [] })).toThrow();
  });
});

describe("skill snippet compiler", () => {
  it("rejects type errors that transpilation alone would accept", async () => {
    const directory = createTempDir();
    await mkdir(path.join(directory, "src"));
    await writeFile(
      path.join(directory, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: { strict: true, noEmit: true, types: [] },
        include: ["src"],
      })
    );
    const file = path.join(directory, "src/example.ts");
    await writeFile(file, 'const value: number = "wrong";');
    expect(checkTypes(directory)).toContain("not assignable");
    await writeFile(file, "const value: number = 1;");
    expect(checkTypes(directory)).toBe("");
  });
});
