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
