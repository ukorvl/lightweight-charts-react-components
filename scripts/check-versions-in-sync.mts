#!/usr/bin/env node

// This script checks that release-version touchpoints stay aligned with lib/package.json.
// It verifies package metadata, the lockfile entry, and the compatibility table of the agent
// skill. The skill's reference versions are a tested baseline, so they only have to stay inside
// the declared ranges instead of matching the latest release.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { getErrorMessage, isMainModule } from "./common.mts";

export type CheckerOptions = {
  repo: string;
  packageJson: string;
  jsrJson: string;
  versionFile: string;
  packageLock: string;
  lockPackageKey: string;
  skillFile: string;
};

export const defaultOptions: CheckerOptions = {
  repo: ".",
  packageJson: "lib/package.json",
  jsrJson: "lib/jsr.json",
  versionFile: "lib/src/version.ts",
  packageLock: "package-lock.json",
  lockPackageKey: "lib",
  skillFile: "skills/lightweight-charts-react-components/SKILL.md",
};

const parseVersion = (version: string) => {
  const parts = version.split(".").map(Number);

  return [parts[0], parts[1] ?? 0, parts[2] ?? 0];
};

const compareVersions = (left: string, right: string) => {
  const [leftParts, rightParts] = [parseVersion(left), parseVersion(right)];
  const index = leftParts.findIndex((part, position) => part !== rightParts[position]);

  return index === -1 ? 0 : leftParts[index] - rightParts[index];
};

/** Supports the `>=min <max` shape used by the skill compatibility table. */
const satisfiesRange = (version: string, range: string) => {
  const match = range.match(/^>=(\S+) <(\S+)$/);

  if (!match) {
    throw new Error(`Unsupported version range: ${range}`);
  }

  return (
    compareVersions(version, match[1]) >= 0 && compareVersions(version, match[2]) < 0
  );
};

const getInlineCode = (text: string) => text.match(/`([^`]+)`/)?.[1];

const readSkillTableRow = (skill: string, skillFile: string, dependency: string) => {
  const row = skill
    .split("\n")
    .map(line => line.split("|").map(cell => cell.trim()))
    .find(cells => cells[1] === dependency);
  const reference = row && getInlineCode(row[2]);
  const range = row && getInlineCode(row[3]);

  if (!range) {
    throw new Error(`Could not read ${dependency} compatibility row from ${skillFile}`);
  }

  return { reference, range };
};

const assertSkillCompatibility = (
  skill: string,
  skillFile: string,
  packageJson: {
    version: string;
    peerDependencies?: Record<string, string>;
    engines?: Record<string, string>;
  }
) => {
  const assertRange = (label: string, actual: string, expected?: string) => {
    if (actual !== expected) {
      throw new Error(
        `${skillFile} ${label} range (${actual}) does not match package.json (${expected})`
      );
    }
  };
  const assertReference = (label: string, reference?: string, range?: string) => {
    if (!reference || !range || !satisfiesRange(reference, range)) {
      throw new Error(
        `${skillFile} ${label} reference version (${reference}) is outside ${range}`
      );
    }
  };

  const library = readSkillTableRow(
    skill,
    skillFile,
    "`lightweight-charts-react-components`"
  );
  const charts = readSkillTableRow(skill, skillFile, "`lightweight-charts`");
  const react = readSkillTableRow(skill, skillFile, "React and React DOM");
  const node = readSkillTableRow(skill, skillFile, "Node.js");
  const peers = packageJson.peerDependencies;

  assertRange("lightweight-charts", charts.range, peers?.["lightweight-charts"]);
  assertRange("react", react.range, peers?.react);
  assertRange("react-dom", react.range, peers?.["react-dom"]);
  assertRange("node", node.range, packageJson.engines?.node);
  assertReference("library", library.reference, library.range);
  assertReference("lightweight-charts", charts.reference, charts.range);
  assertReference("react", react.reference, react.range);

  if (!satisfiesRange(packageJson.version, library.range)) {
    throw new Error(
      `package.json version (${packageJson.version}) is outside the ${skillFile} recipe target (${library.range}). Verify the recipes and update the compatibility table.`
    );
  }
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
  --skill-file <path>`);
}

const parseCliOptions = (argv: string[]): CheckerOptions => {
  const options: CheckerOptions = { ...defaultOptions };

  for (let index = 2; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = argv[index + 1];

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
    if (argument === "--skill-file" && value) {
      options.skillFile = value;
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

  return options;
};

export const run = (options: CheckerOptions = defaultOptions) => {
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

  const messages: string[] = [];

  function assertEqual(label: string, actual: string, expected: string) {
    if (actual !== expected) {
      throw new Error(
        `${label} (${actual}) does not match package.json version (${expected})`
      );
    }

    messages.push(`${label} (${actual}) matches package.json version (${expected}).`);
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

  assertSkillCompatibility(
    readRequiredFile(options.skillFile),
    options.skillFile,
    JSON.parse(readRequiredFile(options.packageJson))
  );
  messages.push(`Compatibility table in ${options.skillFile} matches package.json.`);

  messages.push(`All release version files are in sync at v${packageVersion}.`);
  return messages;
};

if (isMainModule(import.meta.url)) {
  try {
    run(parseCliOptions(process.argv)).forEach(message => {
      writeStdout(message);
    });
  } catch (error) {
    writeStderr(getErrorMessage(error));
    process.exit(1);
  }
}
