import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { extractRecipeBlocks, run } from "../check-skill-recipes.mts";
import { createTempDir, repoRoot, writeTextFile } from "./test-helpers.mts";

const writeSkill = (markdown: string) => {
  const skillsDir = createTempDir();
  writeTextFile(path.join(skillsDir, "demo/references/recipe.md"), markdown);
  return skillsDir;
};

describe("check-skill-recipes", () => {
  it("extracts named and unnamed ts blocks and ignores other languages", () => {
    const markdown = [
      "# Title",
      "```sh",
      "npm install",
      "```",
      "```ts file=shared.ts",
      "export const a = 1;",
      "```",
      "```tsx",
      "export const b = 2;",
      "```",
    ].join("\n");

    expect(extractRecipeBlocks(markdown)).toEqual([
      { fileName: "shared.ts", startLine: 6, code: "export const a = 1;\n" },
      { fileName: "block-2.tsx", startLine: 9, code: "export const b = 2;\n" },
    ]);
  });

  it("extracts blocks from CRLF documents", () => {
    expect(extractRecipeBlocks("```ts\r\nexport const a = 1;\r\n```\r\n")).toEqual([
      { fileName: "block-1.ts", startLine: 2, code: "export const a = 1;\n" },
    ]);
  });

  it("extracts indented and tilde fences", () => {
    const markdown = [
      "1. Item",
      "",
      "   ```ts",
      "   export const a = 1;",
      "   ```",
      "",
      "~~~tsx",
      "export const b = 2;",
      "~~~",
    ].join("\n");

    expect(extractRecipeBlocks(markdown)).toEqual([
      { fileName: "block-1.ts", startLine: 4, code: "export const a = 1;\n" },
      { fileName: "block-2.tsx", startLine: 8, code: "export const b = 2;\n" },
    ]);
  });

  it("ignores TypeScript fences shown inside a longer markdown fence", () => {
    const markdown = ["````markdown", "```ts", "not code", "```", "````"].join("\n");

    expect(extractRecipeBlocks(markdown)).toEqual([]);
  });

  it.each([
    ["typescript", 'language tag must be ts or tsx, got "typescript"'],
    ["TSX", 'language tag must be ts or tsx, got "TSX"'],
    ["ts:a.ts", 'language tag must be ts or tsx, got "ts:a.ts"'],
    ["tsx filename=a.tsx", "only a single file=<name> attribute is supported"],
    ["ts file=a.ts file=b.ts", "only a single file=<name> attribute is supported"],
    ["ts file=../../../a.ts", 'plain .ts or .tsx name, got "../../../a.ts"'],
    ["ts file=sub/a.ts", 'plain .ts or .tsx name, got "sub/a.ts"'],
    ["ts file=C:\\a.ts", 'plain .ts or .tsx name, got "C:\\a.ts"'],
    ["ts file=a.js", 'plain .ts or .tsx name, got "a.js"'],
    ["ts file=", 'plain .ts or .tsx name, got ""'],
  ])("rejects the fence info string %s with its location", (info, message) => {
    const markdown = ["# Title", "", `\`\`\`${info}`, "export {};", "```"].join("\n");

    expect(() => extractRecipeBlocks(markdown, "recipe.md")).toThrow(/^recipe\.md:3: /);
    expect(() => extractRecipeBlocks(markdown, "recipe.md")).toThrow(message);
  });

  it.each([
    ["repeated names", "ts file=a.ts", "ts file=a.ts", "a.ts"],
    ["names differing by case", "ts file=A.ts", "ts file=a.ts", "a.ts"],
    ["a name matching a generated one", "ts file=block-2.ts", "ts", "block-2.ts"],
  ])("rejects %s", (_title, first, second, duplicate) => {
    const markdown = [`\`\`\`${first}`, "", "```", `\`\`\`${second}`, "", "```"].join(
      "\n"
    );

    expect(() => extractRecipeBlocks(markdown, "recipe.md")).toThrow(
      `recipe.md:4: duplicate file name "${duplicate}"`
    );
  });

  it("does not write outside the temporary directory for an unsafe file name", () => {
    const skillsDir = writeSkill("```ts file=../../../escaped.ts\nexport {};\n```\n");

    expect(() => run(repoRoot, skillsDir)).toThrow(
      /demo\/references\/recipe\.md:1: file name must be a plain/
    );
    expect(existsSync(path.join(repoRoot, "node_modules/.cache/escaped.ts"))).toBe(false);
  });

  it("reports errors in an indented block with the markdown location", () => {
    const skillsDir = writeSkill(
      ["1. Item", "", "   ```ts", "   export const a: number = 'nope';", "   ```"].join(
        "\n"
      )
    );

    expect(() => run(repoRoot, skillsDir)).toThrow(/recipe\.md:4: TS2322/);
  });

  it("passes for valid library usage and resolves named blocks across fences", () => {
    const skillsDir = writeSkill(
      [
        "```ts file=data.ts",
        'import type { LineData, UTCTimestamp } from "lightweight-charts";',
        "export const data: LineData<UTCTimestamp>[] = [];",
        "```",
        "```tsx",
        'import { Chart, LineSeries } from "lightweight-charts-react-components";',
        'import { data } from "./data";',
        "export const Demo = () => <Chart><LineSeries data={data} /></Chart>;",
        "```",
      ].join("\n")
    );

    expect(run(repoRoot, skillsDir)).toBe(
      "All 2 skill code blocks compile against the library source."
    );
  });

  it("reports API drift with the markdown location", () => {
    const skillsDir = writeSkill(
      [
        "Some prose.",
        "",
        "```tsx",
        'import { Chart, LineSeries } from "lightweight-charts-react-components";',
        "export const Demo = () => <Chart><LineSeries dataa={[]} /></Chart>;",
        "```",
      ].join("\n")
    );

    expect(() => run(repoRoot, skillsDir)).toThrow(
      /demo\/references\/recipe\.md:5: TS2322/
    );
  });

  it("fails when a relative import has no matching named block", () => {
    const skillsDir = writeSkill(
      ["```ts", 'export { data } from "./missing";', "```"].join("\n")
    );

    expect(() => run(repoRoot, skillsDir)).toThrow(/recipe\.md:2: TS2307/);
  });

  it("fails when there is nothing to check", () => {
    const skillsDir = writeSkill("# No code here\n");

    expect(() => run(repoRoot, skillsDir)).toThrow("No ts or tsx code blocks found");
  });

  it("keeps the skills in this repository compiling", () => {
    expect(run(repoRoot, path.join(repoRoot, "skills"))).toMatch(/^All \d+ skill code/);
  });
});
