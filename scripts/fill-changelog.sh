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
COMMIT_TYPES="feat fixes chore docs refactor test perf ci style revert"

# Colors
COLOR_GREEN="\033[0;32m"
COLOR_YELLOW="\033[0;33m"
COLOR_NC="\033[0m"

# Check that the CHANGELOG.md file exists
if [ ! -f "$CHANGELOG_FILE" ]; then
  echo "CHANGELOG.md file not found!"
  exit 1
fi

# Check that changelog does not contan the current version
CURRENT_VERSION=$(jq -r .version $LIB_PACKAGE_JSON)
if grep -q "## \[$CURRENT_VERSION\]" "$CHANGELOG_FILE"; then
  echo -e "Changelog already contains notes of the current version: ${COLOR_YELLOW}$CURRENT_VERSION${COLOR_NC}" 
  exit 0
fi

# Get the latest tag with version
LAST_TAG=$(git tag --list "v[0-9]*.[0-9]*.[0-9]*" | sort -V | tail -n1)
if [ -z "$LAST_TAG" ]; then
  echo "No tags found, using all commits..."
  GIT_RANGE=""
else
  echo -e "Using commits since last tag: ${COLOR_GREEN}$LAST_TAG${COLOR_NC}"
  GIT_RANGE="$LAST_TAG..HEAD"
fi

# Get the commit messages
COMMITS=$(git log --pretty=format:"%s" $GIT_RANGE | grep -E "^[a-zA-Z]+: ")

# Group the commits by type
for type in $COMMIT_TYPES; do
  commit_types+=("$type")
  commit_messages+=("")
done

while IFS= read -r commit; do
  TYPE=$(echo "$commit" | cut -d':' -f1 | tr '[:upper:]' '[:lower:]' | xargs)
  BODY=$(echo "$commit" | cut -d':' -f2- | xargs)

  for i in "${!commit_types[@]}"; do
    if [ "${commit_types[$i]}" = "$TYPE" ]; then
      commit_messages[$i]+="- $BODY"$'\n'
    fi
  done
done <<< "$COMMITS"

# Generate the new changelog content
NEW_CHANGELOG+="## [$CURRENT_VERSION] - $(date +"%Y-%m-%d")"$'\n'

for i in "${!commit_types[@]}"; do
  commits_for_type="${commit_messages[$i]}"

  if [ -n "$commits_for_type" ]; then
    TITLE="$(tr '[:lower:]' '[:upper:]' <<< ${commit_types[$i]:0:1})${commit_types[$i]:1}"  # Capitalize first letter
    NEW_CHANGELOG+="### $TITLE"$'\n'
    NEW_CHANGELOG+="$commits_for_type"$'\n'
  fi
done

# Extract the content before the changelog header and after it
HEADER_CONTENT=$(head -n 5 "$CHANGELOG_FILE") 
EXISTING_CHANGELOG=$(tail -n +6 "$CHANGELOG_FILE")

# Combine the new changelog and the existing content
echo -e "$HEADER_CONTENT\n\n$NEW_CHANGELOG$EXISTING_CHANGELOG" > "$CHANGELOG_FILE"
echo -e "Changelog updated for version: ${COLOR_GREEN}$CURRENT_VERSION${COLOR_NC}"
