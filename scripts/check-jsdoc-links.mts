#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * This script checks external links in generated jsdoc files.
 */

import { readFile } from "fs/promises";
import path from "node:path";
import chalk from "chalk";
import pLimit from "p-limit";
import ts from "typescript";

/** Key is domain name, value is an array of links, using Set to avoid duplicates */
type LinksMap = Map<string, Set<string>>;

const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const rootDir = path.join(scriptDir, "..");
const libOutputDir = path.join(rootDir, "lib", "dist");
const fileName = "index.d.ts";
const potentiallyDTSBundleFile = path.join(libOutputDir, fileName);

const limitPerTCPConnection = pLimit(10);

/** Avoid throwing errors to check all links even if one of them is broken, push errors to an array instead */
const scriptErrors: string[] = [];

// TODO: remove after deploying docs page
const ignoreDomains = new Set(["ukorvl.github.io"]);

const sourceFile = ts.createSourceFile(
  potentiallyDTSBundleFile,
  await readFile(potentiallyDTSBundleFile, "utf8"),
  ts.ScriptTarget.ESNext,
  true,
  ts.ScriptKind.TS
);

const extractUrlsFromSeeTag = (tag: ts.JSDocTag): string[] => {
  const results: string[] = [];

  if (!Array.isArray(tag.comment)) return results;

  for (const fragment of tag.comment) {
    if ("name" in fragment && fragment.name) {
      const prefix = ts.isIdentifier(fragment.name)
        ? fragment.name.escapedText.toString()
        : "";

      const full = prefix + fragment.text;
      const [url] = full.split("|");

      if (url.trim().startsWith("http")) {
        results.push(url.trim());
      }
    }

    if (!("name" in fragment) && typeof fragment.text === "string") {
      const possibleUrl = fragment.text.trim();

      if (possibleUrl.startsWith("http")) {
        results.push(possibleUrl);
      }

      if (possibleUrl.startsWith("://")) {
        results.push("https" + possibleUrl);
      }
    }
  }

  return results;
};

const main = async () => {
  const linksMap: LinksMap = new Map();

  const visitNode = (node: ts.Node) => {
    const tags = ts.getJSDocTags(node);

    for (const tag of tags) {
      if (tag.tagName.escapedText === "see" && tag.comment) {
        const urls = extractUrlsFromSeeTag(tag);

        for (const url of urls) {
          const urlObj = new URL(url);
          const domain = urlObj.hostname;

          if (ignoreDomains.has(domain)) {
            continue;
          }

          if (!linksMap.has(domain)) {
            linksMap.set(domain, new Set());
          }

          linksMap.get(domain)?.add(url);
        }
      }
    }

    ts.forEachChild(node, visitNode);
  };

  visitNode(sourceFile);

  const domains = Array.from(linksMap.keys());

  return Promise.all(
    domains.map(domain => {
      const links = Array.from(linksMap.get(domain) || []);

      return limitPerTCPConnection(async () => {
        for (const link of links) {
          try {
            const response = await fetch(link, { method: "HEAD" });

            if (!response.ok) {
              scriptErrors.push(`Invalid link: ${link} (status: ${response.status})`);
            }
          } catch (error) {
            scriptErrors.push(`Error fetching link: ${link} (${error})`);
          }
        }
      });
    })
  );
};

main()
  .then(() => {
    if (scriptErrors.length > 0) {
      console.log(
        chalk.red.bold(
          `Found ${scriptErrors.length} errors in ${potentiallyDTSBundleFile}:`
        )
      );
      scriptErrors.forEach(error => console.error(`- ${error}`));
      process.exit(1);
    } else {
      console.log(chalk.green(`All links in ${potentiallyDTSBundleFile} are valid.`));
      process.exit(0);
    }
  })
  .catch(error => {
    console.error(
      `An error occurred while checking jsdoc links in ${potentiallyDTSBundleFile}:`,
      error
    );
    process.exit(1);
  });
