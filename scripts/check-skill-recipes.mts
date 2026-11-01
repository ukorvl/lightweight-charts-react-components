#!/usr/bin/env node

// This script typechecks the TypeScript code blocks of agent skills against the library source,
// so recipes cannot silently drift from the public API.
// Input: `--skills-dir <path>` (default: `skills`), relative to the repository root.
// Output: a summary on stdout, or errors with their markdown file and line on stderr (exit code 1).
// Every `ts`/`tsx` fence is compiled. A fence can be named with `file=<name>` so that other blocks
// of the same markdown file can import it by a relative path (for example, `tsx file=Chart.tsx`).
// Fences are read with a markdown parser, and any TypeScript fence that cannot be compiled as
// written fails the check: other language tags, unknown attributes, unsafe or duplicate file names.
// A skipped block would otherwise look like a passing one.
// Blocks are written under `node_modules/.cache` because that is where bare imports such as
// `react` resolve from, and it needs neither a library build nor changes to the working tree.

import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import MarkdownIt from "markdown-it";
import ts from "typescript";
import { getErrorMessage, getRepoRoot, isMainModule } from "./common.mts";

export type RecipeBlock = {
  fileName: string;
  /** 1-based line of the first code line in the markdown file. */
  startLine: number;
  code: string;
};

type WrittenBlock = RecipeBlock & { markdownFile: string; filePath: string };

const md = new MarkdownIt();

/** Matches `ts` and `tsx`, plus the tags people use for TypeScript that this check rejects. */
const TYPESCRIPT_TAG_PATTERN = /^(?:[cm]?tsx?|typescript(?:react)?)\b/i;
const SUPPORTED_TAG_PATTERN = /^tsx?$/;
/** A plain name without path separators, so a block cannot be written outside its directory. */
const FILE_NAME_PATTERN = /^\w[\w.-]*\.tsx?$/;

const parseFileName = (attributes: string[]) => {
  if (attributes.length === 0) {
    return undefined;
  }

  const [attribute] = attributes;

  if (attributes.length > 1 || !attribute.startsWith("file=")) {
    throw new Error("only a single file=<name> attribute is supported");
  }

  const fileName = attribute.slice("file=".length);

  if (!FILE_NAME_PATTERN.test(fileName)) {
    throw new Error(`file name must be a plain .ts or .tsx name, got "${fileName}"`);
  }

  return fileName;
};

/**
 * Returns the TypeScript blocks of a markdown document. `source` is only used in error messages.
 */
export const extractRecipeBlocks = (markdown: string, source = "markdown") => {
  const blocks: RecipeBlock[] = [];
  const fileNames = new Set<string>();

  for (const token of md.parse(markdown, {})) {
    const [language = "", ...attributes] = token.info.trim().split(/\s+/);

    if (token.type !== "fence" || !TYPESCRIPT_TAG_PATTERN.test(language)) {
      continue;
    }

    const fenceLine = (token.map?.[0] ?? 0) + 1;

    try {
      if (!SUPPORTED_TAG_PATTERN.test(language)) {
        throw new Error(`language tag must be ts or tsx, got "${language}"`);
      }

      const fileName =
        parseFileName(attributes) ?? `block-${blocks.length + 1}.${language}`;
      // Compared case-insensitively because names collide on case-insensitive file systems.
      const fileNameKey = fileName.toLowerCase();

      if (fileNames.has(fileNameKey)) {
        throw new Error(`duplicate file name "${fileName}"`);
      }

      fileNames.add(fileNameKey);
      blocks.push({ fileName, startLine: fenceLine + 1, code: token.content });
    } catch (error) {
      throw new Error(`${source}:${fenceLine}: ${getErrorMessage(error)}`);
    }
  }

  return blocks;
};

const compilerOptionsFor = (repoRoot: string): ts.CompilerOptions => ({
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  moduleDetection: ts.ModuleDetectionKind.Force,
  jsx: ts.JsxEmit.ReactJSX,
  lib: ["lib.es2022.d.ts", "lib.dom.d.ts", "lib.dom.iterable.d.ts"],
  types: [],
  strict: true,
  noEmit: true,
  skipLibCheck: true,
  paths: {
    "lightweight-charts-react-components": [path.join(repoRoot, "lib/src/index.ts")],
    "@/*": [path.join(repoRoot, "lib/src/*")],
  },
});

const writeBlocks = (skillsDir: string, compileDir: string): WrittenBlock[] => {
  const markdownFiles = readdirSync(skillsDir, { recursive: true, encoding: "utf8" })
    .filter(file => file.endsWith(".md"))
    .sort();

  return markdownFiles.flatMap(markdownFile => {
    const blocksDir = path.join(compileDir, markdownFile.replace(/\.md$/, ""));
    const blocks = extractRecipeBlocks(
      readFileSync(path.join(skillsDir, markdownFile), "utf8"),
      markdownFile
    );

    mkdirSync(blocksDir, { recursive: true });

    return blocks.map(block => {
      const filePath = path.join(blocksDir, block.fileName);
      writeFileSync(filePath, block.code);
      return { ...block, markdownFile, filePath };
    });
  });
};

const formatDiagnostic = (diagnostic: ts.Diagnostic, blocks: WrittenBlock[]) => {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
  const block = blocks.find(({ filePath }) => filePath === diagnostic.file?.fileName);

  if (!block || !diagnostic.file || diagnostic.start === undefined) {
    return `TS${diagnostic.code}: ${message}`;
  }

  const { line } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);

  return `${block.markdownFile}:${block.startLine + line}: TS${diagnostic.code}: ${message}`;
};

/**
 * Typechecks every recipe block under `skillsDir`. Throws when a block does not compile,
 * or when no blocks were found, because that means the check is no longer checking anything.
 */
export const run = (repoRoot: string, skillsDir: string) => {
  const cacheDir = path.join(repoRoot, "node_modules", ".cache");
  mkdirSync(cacheDir, { recursive: true });
  const compileDir = mkdtempSync(path.join(cacheDir, "skill-recipes-"));

  try {
    const blocks = writeBlocks(skillsDir, compileDir);

    if (blocks.length === 0) {
      throw new Error(`No ts or tsx code blocks found in ${skillsDir}`);
    }

    const program = ts.createProgram(
      blocks.map(({ filePath }) => filePath),
      compilerOptionsFor(repoRoot)
    );
    // Library sources are covered by `npm run typecheck`, so only recipe errors are reported.
    const errors = ts
      .getPreEmitDiagnostics(program)
      .filter(
        ({ file }) => !file || blocks.some(({ filePath }) => filePath === file.fileName)
      )
      .map(diagnostic => formatDiagnostic(diagnostic, blocks));

    if (errors.length > 0) {
      throw new Error(`Skill recipes do not compile:\n${errors.join("\n")}`);
    }

    return `All ${blocks.length} skill code blocks compile against the library source.`;
  } finally {
    rmSync(compileDir, { recursive: true, force: true });
  }
};

if (isMainModule(import.meta.url)) {
  const repoRoot = getRepoRoot(import.meta.url);
  const [flag, value = "skills"] = process.argv.slice(2);

  try {
    if (flag !== undefined && flag !== "--skills-dir") {
      throw new Error(`Unknown argument: ${flag}`);
    }

    process.stdout.write(`${run(repoRoot, path.resolve(repoRoot, value))}\n`);
  } catch (error) {
    process.stderr.write(`${getErrorMessage(error)}\n`);
    process.exit(1);
  }
}
