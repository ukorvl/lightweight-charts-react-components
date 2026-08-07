#!/usr/bin/env node

// This script checks that release-version touchpoints stay aligned with lib/package.json.
// It verifies package metadata, the lockfile entry, and the versions in readme files.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { assertReadmeVersionReferences } from "./readme-version-references.mts";

type CheckerOptions = {
  repo: string;
  packageJson: string;
  jsrJson: string;
  versionFile: string;
  packageLock: string;
  lockPackageKey: string;
  readmeFiles: string[];
};

const options: CheckerOptions = {
  repo: ".",
  packageJson: "lib/package.json",
  jsrJson: "lib/jsr.json",
  versionFile: "lib/src/version.ts",
  packageLock: "package-lock.json",
  lockPackageKey: "lib",
  readmeFiles: ["lib/README.md"],
};

function writeStdout(message: string) {
  process.stdout.write(`${message}\n`);
}

function writeStderr(message: string) {
  process.stderr.write(`${message}\n`);
}

function usage() {
  writeStderr(`Usage: node scripts/check-versions-in-sync.mts [options]

Options:
  --repo <path>
  --package-json <path>
  --jsr-json <path>
  --version-file <path>
  --package-lock <path>
  --lock-package-key <key>
  --readme-files <comma-separated paths>`);
}

for (let index = 2; index < process.argv.length; index += 1) {
  const argument = process.argv[index];
  const value = process.argv[index + 1];

  if (argument === "--repo" && value) {
    options.repo = value;
    index += 1;
    continue;
  }
  if (argument === "--package-json" && value) {
    options.packageJson = value;
    index += 1;
    continue;
  }
  if (argument === "--jsr-json" && value) {
    options.jsrJson = value;
    index += 1;
    continue;
  }
  if (argument === "--version-file" && value) {
    options.versionFile = value;
    index += 1;
    continue;
  }
  if (argument === "--package-lock" && value) {
    options.packageLock = value;
    index += 1;
    continue;
  }
  if (argument === "--lock-package-key" && value) {
    options.lockPackageKey = value;
    index += 1;
    continue;
  }
  if (argument === "--readme-files" && value) {
    options.readmeFiles = value
      .split(",")
      .map((file: string) => file.trim())
      .filter(Boolean);
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

const repoRoot = path.resolve(options.repo);
const resolveFromRepo = (relativePath: string) => path.join(repoRoot, relativePath);

function readRequiredFile(relativePath: string) {
  const filePath = resolveFromRepo(relativePath);

  if (!existsSync(filePath)) {
    throw new Error(`Missing required file: ${relativePath}`);
  }

  return readFileSync(filePath, "utf8");
}

function readJsonVersion(relativePath: string) {
  const parsed = JSON.parse(readRequiredFile(relativePath));

  if (!parsed.version) {
    throw new Error(`Missing version field in ${relativePath}`);
  }

  return String(parsed.version);
}

function readTypescriptVersion(relativePath: string) {
  const match = readRequiredFile(relativePath).match(
    /export const version = ['"]([^'"]+)['"]/
  );

  if (!match) {
    throw new Error(`Could not read exported version from ${relativePath}`);
  }

  return match[1];
}

function readLockfileVersion(relativePath: string, packageKey: string) {
  const parsed = JSON.parse(readRequiredFile(relativePath));
  const version = parsed.packages?.[packageKey]?.version;

  if (!version) {
    throw new Error(
      `Could not read package-lock version for ${packageKey} from ${relativePath}`
    );
  }

  return String(version);
}

function assertEqual(label: string, actual: string, expected: string) {
  if (actual !== expected) {
    throw new Error(
      `${label} (${actual}) does not match package.json version (${expected})`
    );
  }

  writeStdout(`${label} (${actual}) matches package.json version (${expected}).`);
}

const packageVersion = readJsonVersion(options.packageJson);

assertEqual(options.jsrJson, readJsonVersion(options.jsrJson), packageVersion);
assertEqual(
  options.packageLock,
  readLockfileVersion(options.packageLock, options.lockPackageKey),
  packageVersion
);
assertEqual(
  options.versionFile,
  readTypescriptVersion(options.versionFile),
  packageVersion
);

for (const readmeFile of options.readmeFiles) {
  assertReadmeVersionReferences(readRequiredFile(readmeFile), readmeFile, packageVersion);
  writeStdout(
    `Version-pinned README references in ${readmeFile} match ${packageVersion}.`
  );
}

writeStdout(`All release version files are in sync at v${packageVersion}.`);
