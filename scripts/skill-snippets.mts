#!/usr/bin/env node
// Extracts every TypeScript fence in the chart skill, checks the public package
// types, and mounts each component recipe in Chromium. Inputs: skill Markdown,
// scripts/skill-evals/fixtures/snippets.json, and browser fixtures. Outputs: ignored sources and evidence
// under .cache/skill-evals/snippets; exits nonzero on extraction/type/browser errors.
import { spawnSync } from "node:child_process";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, expect } from "@playwright/test";
import MarkdownIt from "markdown-it";
import ts from "typescript";
import { preview } from "vite";

export type Snippet = {
  source: string;
  line: number;
  file: string;
  code: string;
};
export type SnippetManifest = Record<string, string[]>;

export function parseManifest(value: unknown): SnippetManifest {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Expected a snippet filename map");
  const names = new Set<string>();
  for (const [source, files] of Object.entries(value)) {
    if (
      !/^(?:SKILL|README|references\/[a-z0-9-]+)\.md$/.test(source) ||
      !Array.isArray(files) ||
      !files.length
    )
      throw new Error("Invalid snippet source: " + source);
    for (const file of files) {
      if (
        typeof file !== "string" ||
        !/^[A-Za-z0-9-]+\.tsx?$/.test(file) ||
        names.has(file)
      )
        throw new Error("Invalid or duplicate snippet filename: " + String(file));
      names.add(file);
    }
  }
  return value as SnippetManifest;
}

export function extractSnippets(
  documents: Record<string, string>,
  manifest: SnippetManifest
): Snippet[] {
  const markdown = new MarkdownIt();
  const snippets: Snippet[] = [];
  for (const source of Object.keys(manifest)) {
    if (!(source in documents)) throw new Error("Missing snippet source: " + source);
  }
  for (const [source, document] of Object.entries(documents)) {
    const blocks = markdown
      .parse(document, {})
      .filter(
        token =>
          token.type === "fence" && /^(ts|tsx)$/.test(token.info.trim().split(/\s+/)[0])
      );
    const files = manifest[source] ?? [];
    if (blocks.length !== files.length)
      throw new Error(
        `${source}: ${blocks.length} TypeScript blocks, ${files.length} registered files. Update scripts/skill-evals/fixtures/snippets.json.`
      );
    blocks.forEach((block, index) => {
      if (!files[index].endsWith("." + block.info.trim().split(/\s+/)[0]))
        throw new Error("Fence language does not match " + files[index]);
      snippets.push({
        source,
        line: (block.map?.[0] ?? 0) + 2,
        file: files[index],
        code: block.content,
      });
    });
  }
  if (!snippets.length) throw new Error("No TypeScript snippets found");
  return snippets;
}

async function readMarkdown(directory: string, prefix = "") {
  const documents: Record<string, string> = {};
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === "evals") continue;
    const relative = prefix + entry.name;
    if (entry.isDirectory()) {
      Object.assign(
        documents,
        await readMarkdown(path.join(directory, entry.name), relative + "/")
      );
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      documents[relative] = await readFile(path.join(directory, entry.name), "utf8");
    }
  }
  return documents;
}

export function checkTypes(directory: string): string {
  const config = ts.readConfigFile(
    path.join(directory, "tsconfig.json"),
    ts.sys.readFile
  );
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, directory);
  const diagnostics = [
    ...(config.error ? [config.error] : []),
    ...parsed.errors,
    ...ts.getPreEmitDiagnostics(ts.createProgram(parsed.fileNames, parsed.options)),
  ];
  return ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: file => file,
    getCurrentDirectory: () => directory,
    getNewLine: () => "\n",
  });
}

export async function testSnippets(repo: string) {
  const skill = path.join(repo, "skills/lightweight-charts-react-components");
  const evals = path.join(repo, "scripts/skill-evals/fixtures");
  const manifest = parseManifest(
    JSON.parse(await readFile(path.join(evals, "snippets.json"), "utf8"))
  );
  const snippets = extractSnippets(await readMarkdown(skill), manifest);
  const directory = path.join(repo, ".cache/skill-evals/snippets");
  await rm(directory, { recursive: true, force: true });
  await mkdir(path.join(directory, "src/generated"), { recursive: true });
  for (const snippet of snippets) {
    await writeFile(path.join(directory, "src/generated", snippet.file), snippet.code);
  }
  await cp(
    path.join(evals, "snippet-fixtures.tsx"),
    path.join(directory, "src/fixtures.tsx")
  );
  await writeFile(
    path.join(directory, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        target: "ES2022",
        lib: ["ES2022", "DOM", "DOM.Iterable"],
        module: "ESNext",
        moduleResolution: "Bundler",
        jsx: "react-jsx",
        strict: true,
        noEmit: true,
        skipLibCheck: false,
        isolatedModules: true,
      },
      include: ["src"],
    })
  );
  await writeFile(
    path.join(directory, "src/main.tsx"),
    `import { createRoot } from "react-dom/client";
import { fixtures } from "./fixtures";
const name = new URLSearchParams(location.search).get("recipe");
const fixture = name && fixtures[name];
if (!fixture) throw new Error("Missing browser fixture: " + name);
const root = createRoot(document.getElementById("root")!);
root.render(fixture);
document.body.style.margin = "0";
document.body.style.width = "960px";
document.getElementById("unmount")!.onclick = () => root.unmount();
`
  );
  // Keep the unmount control outside the React tree to exercise actual cleanup.
  await writeFile(
    path.join(directory, "index.html"),
    '<button id="unmount">Unmount</button><div id="root"></div><script type="module" src="/src/main.tsx"></script>'
  );
  const typeErrors = checkTypes(directory);
  await writeFile(path.join(directory, "typecheck.log"), typeErrors);
  await writeFile(
    path.join(directory, "sources.json"),
    JSON.stringify(snippets, null, 2)
  );
  if (typeErrors) throw new Error(typeErrors);
  const build = spawnSync(
    process.execPath,
    [path.join(repo, "node_modules/vite/bin/vite.js"), "build"],
    {
      cwd: directory,
      encoding: "utf8",
      timeout: 60000,
    }
  );
  await writeFile(path.join(directory, "build.log"), build.stdout + build.stderr);
  if (build.status !== 0)
    throw new Error("Snippet build failed: " + String(build.error ?? build.stderr));
  const results: { recipe: string; passed: boolean; errors: string[] }[] = [];
  let server: Awaited<ReturnType<typeof preview>> | undefined;
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  try {
    // Serve the compiled app, avoiding development dependency-discovery reloads.
    server = await preview({
      configFile: false,
      root: directory,
      logLevel: "error",
      preview: { host: "127.0.0.1", port: 0 },
    });
    const address = server.httpServer?.address();
    if (!address || typeof address === "string")
      throw new Error("No snippet server address");
    browser = await chromium.launch({ headless: true });
    for (const snippet of snippets.filter(value => value.file.endsWith(".tsx"))) {
      const recipe = path.basename(snippet.file, ".tsx");
      const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.stack ?? error.message));
      page.on("console", message => {
        if (message.type() === "error") errors.push(message.text());
      });
      try {
        await page.goto(
          `http://127.0.0.1:${address.port}/?recipe=${encodeURIComponent(recipe)}`
        );
        await expect(page.locator("canvas").first()).toBeVisible();
        await page.evaluate(
          () =>
            new Promise<void>(resolve =>
              requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
            )
        );
        await page.screenshot({
          path: path.join(directory, recipe + ".png"),
          fullPage: true,
        });
        await page.getByRole("button", { name: "Unmount", exact: true }).click();
        await expect(page.locator("#root")).toBeEmpty();
        await page.evaluate(
          () =>
            new Promise<void>(resolve =>
              requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
            )
        );
      } catch (error) {
        errors.push(String(error));
      } finally {
        results.push({ recipe, passed: !errors.length, errors });
        await page.close();
      }
    }
  } finally {
    await browser?.close();
    await server?.close();
    await writeFile(
      path.join(directory, "results.json"),
      JSON.stringify(results, null, 2)
    );
  }
  if (results.some(result => !result.passed))
    throw new Error(
      "Snippet browser checks failed: " +
        JSON.stringify(results.filter(result => !result.passed))
    );
  return { snippets: snippets.length, renderedRecipes: results.length, passed: true };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.stdout.write(
      JSON.stringify(
        await testSnippets(
          path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
        )
      ) + "\n"
    );
  } catch (error) {
    process.stderr.write(String(error) + "\n");
    process.exitCode = 1;
  }
}
