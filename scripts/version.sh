#!/bin/bash

# This script handles version bumps for a project (in all required places)
# Handful replacement of "npm version" command

set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
source "$SCRIPT_DIR/common.sh"

check_command jq
check_command prettier
check_command npm
check_command perl

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 [patch|minor|major]"
  exit 1
fi

JSR_JSON="$REPO_ROOT/$LIB_PATH/jsr.json"
TS_VERSION_FILE="$REPO_ROOT/$LIB_PATH/src/version.ts"

version_type=$1

if [[ "$version_type" != "patch" && "$version_type" != "minor" && "$version_type" != "major" ]]; then
  echo "Error: Invalid argument '$version_type'. Allowed values are: patch, minor, major."
  exit 1
fi

echo "You selected a $version_type version bump."

# Bump the version in package.json
cd "$REPO_ROOT/$LIB_PATH"
npm version "$version_type" --no-git-tag-version

new_version=$(jq -r '.version' "$LIB_PACKAGE_JSON")
if [ -z "$new_version" ]; then
  echo "Error: Failed to extract new version from package.json."
  exit 1
fi

# Update the version in jsr.json
jq --arg new_version "$new_version" '.version = $new_version' "$JSR_JSON" > "$JSR_JSON.tmp" && mv "$JSR_JSON.tmp" "$JSR_JSON"
prettier --write "$JSR_JSON"

# Update the version in version.ts
perl -pi -e "s|^export const version = .*|export const version = '$new_version';|" "$TS_VERSION_FILE"
prettier --write "$TS_VERSION_FILE"
