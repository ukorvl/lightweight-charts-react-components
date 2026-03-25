#!/usr/bin/env node
/* eslint-disable no-console */

// This script checks all markdown files in the repository for broken links.
// It verifies relative links, anchors and external links.

import { existsSync, readFileSync, statSync } from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { glob } from "glob";
import MarkdownIt from "markdown-it";
import markdownAnchors from "markdown-it-anchor";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(scriptDir, "..");
const md = MarkdownIt().use(markdownAnchors);

type LinkError = {
  file: string;
  line: number;
  href: string;
  error: string;
};

type Link = {
  href: string;
  line: number;
  file: string;
};

type FetchLike = typeof globalThis.fetch;

const MIN_SUCCESS_STATUS_CODE = 200;
const MAX_SUCCESS_STATUS_CODE = 399;
const FILE_CONCURRENCY_LIMIT = 5;
const LINK_CONCURRENCY_LIMIT = 10;

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export class LinkChecker {
  errors: Array<LinkError>;
  fileAnchors: Map<string, Set<string>>;
  rootDir: string;
  fetchImpl: FetchLike;

  constructor(rootDirectory = rootDir, fetchImpl: FetchLike = globalThis.fetch) {
    this.errors = [];
    this.fileAnchors = new Map();
    this.rootDir = rootDirectory;
    this.fetchImpl = fetchImpl;
  }

  extractLinks(content: string, filePath: string) {
    const links: Array<Link> = [];
    const tokens = md.parse(content, {});

    const extractFromTokens = (tks: ReturnType<typeof md.parse>) => {
      for (const token of tks) {
        if (token.type === "link_open") {
          const href = token.attrGet("href");

          if (href) {
            links.push({
              href,
              line: token.map ? token.map[0] + 1 : 0,
              file: filePath,
            });
          }
        }
        if (token.children) {
          extractFromTokens(token.children);
        }
      }
    };

    extractFromTokens(tokens);
    return links;
  }

  extractAnchors(content: string) {
    const anchors = new Set<string>();
    const tokens = md.parse(content, {});

    for (let index = 0; index < tokens.length; index++) {
      const token = tokens[index];
      if (token.type === "heading_open") {
        const id = token.attrGet("id");

        if (id) {
          anchors.add(this.normalizeAnchor(id));
          continue;
        }

        const nextToken = tokens[index + 1];
        if (nextToken?.type === "inline") {
          const fallbackAnchor = nextToken.content
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .trim();

          if (fallbackAnchor) {
            anchors.add(this.normalizeAnchor(fallbackAnchor));
          }
        }
      }
    }

    return anchors;
  }

  normalizeAnchor(anchor: string) {
    try {
      return decodeURIComponent(anchor).trim().toLowerCase();
    } catch {
      console.warn(`Warning: could not decode anchor "${anchor}", using raw value`);
      return anchor.trim().toLowerCase();
    }
  }

  fileExists(filePath: string) {
    try {
      return existsSync(filePath);
    } catch {
      return false;
    }
  }

  getFileAnchors(filePath: string) {
    if (this.fileAnchors.has(filePath)) {
      return this.fileAnchors.get(filePath)!;
    }

    try {
      const content = readFileSync(filePath, "utf-8");
      const anchors = this.extractAnchors(content);
      this.fileAnchors.set(filePath, anchors);
      return anchors;
    } catch (error) {
      console.warn(`Could not read file ${filePath}: ${getErrorMessage(error)}`);
      return new Set<string>();
    }
  }

  isSkippableLink(href: string) {
    return (
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("javascript:") ||
      href.startsWith("data:")
    );
  }

  isSuccessfulHttpStatus(status: number) {
    return status >= MIN_SUCCESS_STATUS_CODE && status <= MAX_SUCCESS_STATUS_CODE;
  }

  resolveTargetPath(baseFile: string, linkPath: string) {
    const sanitizedLinkPath = linkPath.split("?")[0];

    if (!sanitizedLinkPath) {
      return null;
    }

    const currentDir = path.dirname(baseFile);
    const resolvedPath = sanitizedLinkPath.startsWith("/")
      ? path.resolve(this.rootDir, `.${sanitizedLinkPath}`)
      : path.resolve(currentDir, sanitizedLinkPath);

    if (this.fileExists(resolvedPath) && !this.isDirectory(resolvedPath)) {
      return resolvedPath;
    }

    const markdownCandidate = `${resolvedPath}.md`;
    if (this.fileExists(markdownCandidate)) {
      return markdownCandidate;
    }

    const readmeCandidate = path.join(resolvedPath, "README.md");
    if (this.fileExists(readmeCandidate)) {
      return readmeCandidate;
    }

    const indexCandidate = path.join(resolvedPath, "index.md");
    if (this.fileExists(indexCandidate)) {
      return indexCandidate;
    }

    return null;
  }

  isDirectory(filePath: string) {
    try {
      return statSync(filePath).isDirectory();
    } catch {
      return false;
    }
  }

  async checkExternalLink({ href, file, line }: Link) {
    const normalizedHref = href.startsWith("//") ? `https:${href}` : href;

    try {
      const response = await this.fetchImpl(normalizedHref);

      if (!this.isSuccessfulHttpStatus(response.status)) {
        this.errors.push({
          file,
          line,
          href,
          error: `External link returned status ${response.status}`,
        });
        return false;
      }
    } catch (error) {
      this.errors.push({
        file,
        line,
        href,
        error: `External link check failed: ${getErrorMessage(error)}`,
      });
      return false;
    }

    return true;
  }

  async checkLink({ href, file, line }: Link) {
    if (href.startsWith("http://") || href.startsWith("https://")) {
      return this.checkExternalLink({ href, file, line });
    }

    if (href.startsWith("//")) {
      return this.checkExternalLink({ href, file, line });
    }

    if (this.isSkippableLink(href)) {
      return true;
    }

    if (href.startsWith("#")) {
      const anchor = this.normalizeAnchor(href.substring(1));
      const fileAnchors = this.getFileAnchors(file);

      if (!fileAnchors.has(anchor)) {
        this.errors.push({
          file,
          line,
          href,
          error: `Anchor '#${anchor}' not found in current file`,
        });
        return false;
      }
      return true;
    }

    const [linkPath, anchor] = href.split("#");
    const resolvedPath = this.resolveTargetPath(file, linkPath);

    if (!resolvedPath) {
      this.errors.push({
        file,
        line,
        href,
        error: `File not found for link path: ${linkPath}`,
      });
      return false;
    }

    if (anchor) {
      const normalizedAnchor = this.normalizeAnchor(anchor);
      const targetAnchors = this.getFileAnchors(resolvedPath);

      if (!targetAnchors.has(normalizedAnchor)) {
        this.errors.push({
          file,
          line,
          href,
          error: `Anchor '#${normalizedAnchor}' not found in ${resolvedPath}`,
        });
        return false;
      }
    }

    return true;
  }

  async checkFile(filePath: string) {
    try {
      const content = readFileSync(filePath, "utf-8");
      const links = this.extractLinks(content, filePath);

      if (links.length === 0) {
        console.log(`No links found in ${path.relative(this.rootDir, filePath)}`);
        return 0;
      }

      console.log(
        `Checking ${links.length} links in ${path.relative(this.rootDir, filePath)}`
      );

      await processWithConcurrency(links, LINK_CONCURRENCY_LIMIT, link =>
        this.checkLink(link)
      );

      return links.length;
    } catch (error) {
      this.errors.push({
        file: filePath,
        line: 0,
        href: "",
        error: `Could not read file: ${getErrorMessage(error)}`,
      });
      return 0;
    }
  }

  generateReport() {
    console.log("\n" + "=".repeat(50));
    console.log("MARKDOWN LINK CHECK REPORT");
    console.log("=".repeat(50));

    if (this.errors.length === 0) {
      console.log("All links are valid!");
      return true;
    }

    console.log(`Found ${this.errors.length} broken links:\n`);

    const errorsByFile = new Map<string, LinkError[]>();
    for (const error of this.errors) {
      const relativePath = path.relative(this.rootDir, error.file);
      if (!errorsByFile.has(relativePath)) {
        errorsByFile.set(relativePath, []);
      }
      errorsByFile.get(relativePath).push(error);
    }

    for (const [file, errors] of errorsByFile) {
      console.log(`${file}:`);
      for (const error of errors) {
        console.log(`  Line ${error.line}: ${error.href}`);
        console.log(`  ❌ ${error.error}`);
      }
      console.log();
    }

    return false;
  }
}

async function main() {
  const checker = new LinkChecker();

  const markdownFiles = await glob("**/*.md", {
    cwd: rootDir,
    absolute: true,
    ignore: ["**/node_modules/**", "**/dist/**", "**/coverage/**"],
  });

  console.log(`Found ${markdownFiles.length} markdown files to check\n`);

  await processWithConcurrency(markdownFiles, FILE_CONCURRENCY_LIMIT, file =>
    checker.checkFile(file)
  );

  const success = checker.generateReport();
  if (!success) {
    process.exit(1);
  }
}

/**
 * Runs async work over items in bounded-size batches.
 *
 * @param items - Items to process.
 * @param concurrency - Maximum number of items processed in parallel per batch.
 * @param worker - Async callback executed for each item.
 */
async function processWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<unknown>
) {
  if (items.length === 0) {
    return;
  }

  const safeConcurrency = Math.max(1, concurrency);
  if (safeConcurrency !== concurrency) {
    console.warn(
      `Warning: concurrency "${concurrency}" is invalid, using ${safeConcurrency}`
    );
  }

  for (let index = 0; index < items.length; index += safeConcurrency) {
    const chunk = items.slice(index, index + safeConcurrency);
    await Promise.all(chunk.map(item => worker(item)));
  }
}

const isMainModule =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMainModule) {
  main().catch(error => {
    console.error("Script failed:", error);
    process.exit(1);
  });
}
