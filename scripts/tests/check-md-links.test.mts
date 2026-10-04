import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import { describe, expect, it } from "vitest";
import { markdownIgnorePatterns } from "../check-md-links.mts";
import { createTempDir } from "./test-helpers.mts";

describe("markdown source discovery", () => {
  it("includes maintained eval docs while excluding copied runtime docs and caches", async () => {
    const root = createTempDir();
    const files = [
      "skills/lightweight-charts-react-components/evals/PLAN.md",
      "scripts/skill-evals/README.md",
      "skills/lightweight-charts-react-components-workspace/iteration-1/outputs/skill/SKILL.md",
      ".cache/skill-evals/consumer/docs/library.md",
    ];
    for (const file of files) {
      await mkdir(path.dirname(path.join(root, file)), { recursive: true });
      await writeFile(path.join(root, file), "# Documentation");
    }
    const discovered = await glob("**/*.md", {
      cwd: root,
      ignore: markdownIgnorePatterns,
    });
    expect(discovered.sort()).toEqual(files.slice(0, 2).sort());
  });
});
