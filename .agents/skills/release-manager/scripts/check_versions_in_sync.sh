#!/bin/bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage: check_versions_in_sync.sh --repo <path> [--package-json lib/package.json] [--jsr-json lib/jsr.json] [--version-file lib/src/version.ts] [--package-lock package-lock.json] [--lock-package-key lib]
EOF
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: Required command '$1' is not available." >&2
    exit 1
  fi
}

read_json_version() {
  node --input-type=module -e '
    import { readFileSync } from "node:fs";

    const file = process.argv[1];
    const json = JSON.parse(readFileSync(file, "utf8"));
    if (!json.version) {
      console.error(`Error: Missing version field in ${file}`);
      process.exit(1);
    }
    process.stdout.write(String(json.version));
  ' "$1"
}

read_ts_version() {
  node --input-type=module -e '
    import { readFileSync } from "node:fs";

    const file = process.argv[1];
    const text = readFileSync(file, "utf8");
    const match = text.match(/export const version = [\"\x27]([^\"\x27]+)[\"\x27]/);
    if (!match) {
      console.error(`Error: Could not read exported version from ${file}`);
      process.exit(1);
    }
    process.stdout.write(match[1]);
  ' "$1"
}

read_lockfile_package_version() {
  node --input-type=module -e '
    import { readFileSync } from "node:fs";

    const file = process.argv[1];
    const packageKey = process.argv[2];
    const json = JSON.parse(readFileSync(file, "utf8"));
    const version = json.packages?.[packageKey]?.version;

    if (!version) {
      console.error(`Error: Could not read package-lock version for ${packageKey} from ${file}`);
      process.exit(1);
    }

    process.stdout.write(String(version));
  ' "$1" "$2"
}

REPO_PATH=""
PACKAGE_JSON="lib/package.json"
JSR_JSON="lib/jsr.json"
VERSION_FILE="lib/src/version.ts"
PACKAGE_LOCK="package-lock.json"
LOCK_PACKAGE_KEY="lib"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo)
      REPO_PATH="$2"
      shift 2
      ;;
    --package-json)
      PACKAGE_JSON="$2"
      shift 2
      ;;
    --jsr-json)
      JSR_JSON="$2"
      shift 2
      ;;
    --version-file)
      VERSION_FILE="$2"
      shift 2
      ;;
    --package-lock)
      PACKAGE_LOCK="$2"
      shift 2
      ;;
    --lock-package-key)
      LOCK_PACKAGE_KEY="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Error: Unknown argument '$1'." >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$REPO_PATH" ]]; then
  echo "Error: --repo is required." >&2
  usage
  exit 1
fi

require_command node

REPO_PATH=$(cd "$REPO_PATH" && pwd)
PACKAGE_JSON_PATH="$REPO_PATH/$PACKAGE_JSON"
JSR_JSON_PATH="$REPO_PATH/$JSR_JSON"
VERSION_FILE_PATH="$REPO_PATH/$VERSION_FILE"
PACKAGE_LOCK_PATH="$REPO_PATH/$PACKAGE_LOCK"

for file in "$PACKAGE_JSON_PATH" "$JSR_JSON_PATH" "$PACKAGE_LOCK_PATH"; do
  if [[ ! -f "$file" ]]; then
    echo "Error: Missing required file $file." >&2
    exit 1
  fi
done

PACKAGE_VERSION=$(read_json_version "$PACKAGE_JSON_PATH")
JSR_VERSION=$(read_json_version "$JSR_JSON_PATH")
LOCKFILE_VERSION=$(read_lockfile_package_version "$PACKAGE_LOCK_PATH" "$LOCK_PACKAGE_KEY")

if [[ "$JSR_VERSION" != "$PACKAGE_VERSION" ]]; then
  echo "Error: jsr.json version ($JSR_VERSION) does not match package.json version ($PACKAGE_VERSION)." >&2
  exit 1
fi

if [[ "$LOCKFILE_VERSION" != "$PACKAGE_VERSION" ]]; then
  echo "Error: package-lock version for $LOCK_PACKAGE_KEY ($LOCKFILE_VERSION) does not match package.json version ($PACKAGE_VERSION)." >&2
  exit 1
fi

if [[ -f "$VERSION_FILE_PATH" ]]; then
  TS_VERSION=$(read_ts_version "$VERSION_FILE_PATH")
  if [[ "$TS_VERSION" != "$PACKAGE_VERSION" ]]; then
    echo "Error: version.ts version ($TS_VERSION) does not match package.json version ($PACKAGE_VERSION)." >&2
    exit 1
  fi
else
  echo "Warning: $VERSION_FILE_PATH does not exist, skipping version.ts check."
fi

echo "All release version files are in sync at v$PACKAGE_VERSION."
