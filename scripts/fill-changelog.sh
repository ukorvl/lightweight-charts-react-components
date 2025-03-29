#!/bin/bash

# This script generates a changelog based on the commits since the last tag.
# It groups the commits by type (feature, fix, chore, docs, refactor, test) and
# appends them to the CHANGELOG.md file.

set -euo pipefail

# Settings
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
REPO_ROOT="$SCRIPT_DIR/.."
CHANGELOG_FILE="$REPO_ROOT/lib/CHANGELOG.md"
LIB_PACKAGE_JSON="$REPO_ROOT/lib/package.json"
COMMIT_TYPES="features fixes chore docs refactor test"

# Check that the CHANGELOG.md file exists
if [ ! -f "$CHANGELOG_FILE" ]; then
  echo "CHANGELOG.md file not found!"
  exit 1
fi

# Check that changelog does not contan the current version
CURRENT_VERSION=$(jq -r .version $LIB_PACKAGE_JSON)
if grep -q "## v$CURRENT_VERSION" $CHANGELOG_FILE; then
  echo "Changelog already contains the current version: $CURRENT_VERSION notes"
  exit 0
fi

# Get the latest tag with version
LAST_TAG=$(git tag --list "v[0-9]*.[0-9]*.[0-9]*" | sort -V | tail -n1)
if [ -z "$LAST_TAG" ]; then
  echo "No tags found, using all commits..."
  GIT_RANGE=""
else
  echo "Using commits since last tag: $LAST_TAG"
  GIT_RANGE="$LAST_TAG..HEAD"
fi

# Get the commit messages
COMMITS=$(git log --pretty=format:"%s" $GIT_RANGE | grep -E "^[a-zA-Z]+: ")

# Group the commits by type
declare -A grouped_commits
for type in $COMMIT_TYPES; do
  grouped_commits[$type]=""
done

while IFS= read -r commit; do
  TYPE=$(echo "$commit" | cut -d':' -f1 | tr '[:upper:]' '[:lower:]' | xargs)
  BODY=$(echo "$commit" | cut -d':' -f2- | xargs)
  
  if [[ " ${commit_types[*]} " =~ " $TYPE " ]]; then
    grouped_commits[$TYPE]+="- $BODY"$'\n'
  fi
done <<< "$COMMITS"

NEW_CHANGELOG="## $(date +"%Y-%m-%d") Release"$'\n\n'

for type in "${commit_types[@]}"; do
  if [ -n "${grouped_commits[$type]}" ]; then
    TITLE="$(tr '[:lower:]' '[:upper:]' <<< ${type:0:1})${type:1}"  # Capitalize first letter
    NEW_CHANGELOG+="### $TITLE"$'\n'
    NEW_CHANGELOG+="${grouped_commits[$type]}"$'\n'
  fi
done

# Append the new changelog to the existing one
if [ -f "$CHANGELOG_FILE" ]; then
  echo -e "$NEW_CHANGELOG\n$(cat $CHANGELOG_FILE)" > $CHANGELOG_FILE
else
  echo -e "$NEW_CHANGELOG" > $CHANGELOG_FILE
fi

echo "Changelog updated for version: $LAST_TAG"
