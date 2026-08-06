import { readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { render } from "@testing-library/react";
import React from "react";

const repoRoot = path.resolve(__dirname, "..", "..");
const snippetDirectories = [
  path.join(repoRoot, "docs", "current", "snippets"),
  path.join(repoRoot, "docs", "versions", "v2.3", "snippets"),
  path.join(repoRoot, "docs", "versions", "v2.2", "snippets"),
];

const snippetFiles = snippetDirectories.flatMap(directory =>
  readdirSync(directory)
    .filter(fileName => fileName.endsWith(".tsx"))
    .map(fileName => path.join(directory, fileName))
);

describe("docs snippets", () => {
  for (const snippetFile of snippetFiles) {
    it(`renders ${path.relative(repoRoot, snippetFile)}`, async () => {
      const module = await import(pathToFileURL(snippetFile).href);
      const App = module.App as (() => JSX.Element) | undefined;

      expect(App).toBeDefined();

      const { container } = render(<App />);
      expect(container.firstChild).toBeInTheDocument();
    });
  }
});
