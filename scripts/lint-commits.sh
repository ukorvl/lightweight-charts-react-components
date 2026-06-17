#!/bin/bash

# This script checks commits in the configured range for compliance with the
# commit message format.

set -euo pipefail

# Check if the repository is shallow
IS_SHALLOW=$(git rev-parse --is-shallow-repository)

# If the repository is shallow, fetch all commits
if [ "$IS_SHALLOW" = "true" ]; then
  echo "Repository is shallow. Fetching all commits..."
  git fetch --unshallow
fi

# Allow CI to lint only the commits introduced by a PR.
COMMITLINT_FROM_REF=${COMMITLINT_FROM_REF:-}

if [ -n "$COMMITLINT_FROM_REF" ]; then
  FROM_REF="$COMMITLINT_FROM_REF"
  NUMBER_OF_COMMITS=$(git rev-list --count "$FROM_REF..HEAD")
else
  # Fall back to linting the current branch history when no explicit base is provided.
  FROM_REF=$(git rev-list --max-parents=0 HEAD)
  NUMBER_OF_COMMITS=$(git rev-list --count HEAD)
fi

echo "Linting $NUMBER_OF_COMMITS commits..."

# Run commitlint for the selected range.
echo "Running Commitlint from $FROM_REF to HEAD..."
npx commitlint --from="$FROM_REF" --to=HEAD
echo "All commit messages are valid."
