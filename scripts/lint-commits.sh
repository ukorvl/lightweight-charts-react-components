#!/bin/bash

# This script checks all commits in the current branch for compliance with the
# commit message format.

set -euo pipefail

# Check if the repository is shallow
IS_SHALLOW=$(git rev-parse --is-shallow-repository)

# If the repository is shallow, fetch all commits
if [ "$IS_SHALLOW" = "true" ]; then
  echo "Repository is shallow. Fetching all commits..."
  git fetch --unshallow
fi

# Get the first commit hash (the base commit)
FIRST_COMMIT=$(git rev-list --max-parents=0 HEAD)
NUMBER_OF_COMMITS=$(git rev-list --count HEAD)

echo "Linting $NUMBER_OF_COMMITS commits..."

# Run commitlint for all commits
echo "Running Commitlint on all commits..."
npx commitlint --from=$FIRST_COMMIT --to=HEAD

# Check the result
if [ $? -eq 0 ]; then
  echo "All commit messages are valid."
else
  echo "Some commit messages are invalid."
  exit 1
fi
