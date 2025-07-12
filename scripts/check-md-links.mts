#!/usr/bin/env node
/* eslint-disable no-console */

// This script checks all markdown files in the repository for broken links.
// It verifies only relative links and anchors, ignoring external links.

import { existsSync, readFileSync } from "node:fs";
import * as path from "node:path";
import { glob } from "glob";
import MarkdownIt from "markdown-it";
import markdownAnchors from "markdown-it-anchor";

const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const rootDir = path.join(scriptDir, "..");
const md = MarkdownIt().use(markdownAnchors);

type Error = {
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

class LinkChecker {
  errors: Array<Error>;
  fileAnchors: Map<string, Set<string>>;

  constructor() {
    this.errors = [];
    this.fileAnchors = new Map();
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

    for (const token of tokens) {
      if (token.type === "heading_open") {
        const nextToken = tokens[tokens.indexOf(token) + 1];

        if (nextToken && nextToken.type === "inline") {
          const headingText = nextToken.content;
          const anchor = headingText
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .trim();
          anchors.add(anchor);
        }
      }
    }

    return anchors;
  }

  fileExists(filePath) {
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
      console.warn(`Could not read file ${filePath}: ${error.message}`);
      return new Set<string>();
    }
  }

  checkLink({ href, file, line }: Link) {
    if (href.startsWith("http://") || href.startsWith("https://")) {
      return true;
    }

    if (href.startsWith("//")) {
      return true;
    }

    if (href.startsWith("#")) {
      const anchor = href.substring(1);
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
    const currentDir = path.dirname(file);
    const resolvedPath = path.resolve(currentDir, linkPath);

    if (!this.fileExists(resolvedPath)) {
      this.errors.push({
        file,
        line,
        href,
        error: `File not found: ${resolvedPath}`,
      });
      return false;
    }

    if (anchor) {
      const targetAnchors = this.getFileAnchors(resolvedPath);

      if (!targetAnchors.has(anchor)) {
        this.errors.push({
          file,
          line,
          href,
          error: `Anchor '#${anchor}' not found in ${resolvedPath}`,
        });
        return false;
      }
    }

    return true;
  }

  checkFile(filePath: string) {
    try {
      const content = readFileSync(filePath, "utf-8");
      const links = this.extractLinks(content, filePath);

      if (links.length === 0) {
        console.log(`No links found in ${path.relative(rootDir, filePath)}`);
        return 0;
      }

      console.log(
        `Checking ${links.length} links in ${path.relative(rootDir, filePath)}`
      );

      for (const link of links) {
        this.checkLink(link);
      }

      return links.length;
    } catch (error) {
      this.errors.push({
        file: filePath,
        line: 0,
        href: "",
        error: `Could not read file: ${error.message}`,
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

    const errorsByFile = new Map();
    for (const error of this.errors) {
      const relativePath = path.relative(rootDir, error.file);
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

  for (const file of markdownFiles) {
    checker.checkFile(file);
  }

  const success = checker.generateReport();
  if (!success) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error("Script failed:", error);
  process.exit(1);
});
