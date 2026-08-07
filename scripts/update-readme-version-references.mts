#!/usr/bin/env node
/**
 * Updates the configured version-pinned references in a README file to a
 * specific release version. Fails when an expected reference template is
 * missing so release automation does not silently drift.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { getErrorMessage, isMainModule } from "./common.mts";
import { updateReadmeVersionReferences } from "./readme-version-references.mts";

type CliOptions = {
  readmeFile: string;
  version: string;
};

const writeStderr = (message: string) => {
  process.stderr.write(`${message}\n`);
};

const usage = () => {
  writeStderr(`Usage: node scripts/update-readme-version-references.mts [options]

Options:
  --readme-file <path>
  --version <semver>`);
};

const parseCliOptions = (argv: string[]): CliOptions => {
  let readmeFile = "";
  let version = "";

  for (let index = 2; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = argv[index + 1];

    if (argument === "--readme-file" && value) {
      readmeFile = value;
      index += 1;
      continue;
    }

    if (argument === "--version" && value) {
      version = value;
      index += 1;
      continue;
    }

    if (argument === "-h" || argument === "--help") {
      usage();
      process.exit(0);
    }

    usage();
    throw new Error(`Unknown or incomplete argument: ${argument}`);
  }

  if (!readmeFile || !version) {
    usage();
    throw new Error("Both --readme-file and --version are required.");
  }

  return { readmeFile, version };
};

export const run = (options: CliOptions) => {
  const contents = readFileSync(options.readmeFile, "utf8");
  const nextContents = updateReadmeVersionReferences(contents, options.version);
  writeFileSync(options.readmeFile, nextContents);
};

if (isMainModule(import.meta.url)) {
  try {
    run(parseCliOptions(process.argv));
  } catch (error) {
    writeStderr(getErrorMessage(error));
    process.exit(1);
  }
}
