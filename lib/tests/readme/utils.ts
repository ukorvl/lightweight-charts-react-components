import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import path from "node:path";
import MarkdownIt from "markdown-it";

const snippetsDir = path.resolve(__dirname, "extracted-snippets");
if (existsSync(snippetsDir)) {
  rmSync(snippetsDir, { recursive: true, force: true });
}
mkdirSync(snippetsDir, { recursive: true });

const extractSnippets = () => {
  const readme = path.resolve(__dirname, "../../../README.md");
  const contents = readFileSync(readme, "utf-8");
  const md = new MarkdownIt();

  const tokens = md.parse(contents, {});
  const codeSnippets = tokens
    .filter(token => token.type === "fence" && token.info.trim().startsWith("tsx"))
    .map(token => token.content.trim());

  if (codeSnippets.length === 0) {
    throw new Error("No code snippets found in README.md");
  }

  codeSnippets.forEach((snippet, index) => {
    const filePath = path.join(snippetsDir, `Snippet${index + 1}.tsx`);
    writeFileSync(filePath, snippet, "utf-8");
  });
};

export { extractSnippets, snippetsDir };
