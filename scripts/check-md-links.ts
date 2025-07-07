#!/usr/bin/env node

/**
 * This script checks that all local links in markdown files are valid (include anchors)
 */

// import * as path from "node:path";
// import { glob } from "glob";
// import MarkdownIt from "markdown-it";
// import markdownAnchors from "markdown-it-anchor";

// const __dirname = path.dirname(new URL(import.meta.url).pathname);
// const rootDir = path.join(__dirname, "..", "..");

// const md = MarkdownIt().use(markdownAnchors);

// const markdownFiles = await glob("**/*.md", {
//   cwd: rootDir,
//   absolute: true,
// });

// const checkLinks = async filePath => {
//   const content = await import(filePath);
//   const html = md.render(content.default);
//   const links = html.match(/href="([^"]+)"/g) || [];

//   for (const link of links) {
//     const href = link.replace(/href="|"/g, "");
//     if (!href.startsWith("#")) continue; // Skip non-anchor links

//     const anchor = href.slice(1); // Remove the leading '#'
//     if (!html.includes(`id="${anchor}"`)) {
//     }
//   }
// };

// for (const file of markdownFiles) {
//   await checkLinks(file);
// }
