#!/bin/bash

# This script builds the lib and examples
# It requires jq to be installed

set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
REPO_ROOT="$SCRIPT_DIR/.."
LIB_PATH="lib"
LIB_PACKAGE_JSON="$REPO_ROOT/lib/package.json"
ROOT_PACKAGE_JSON="$REPO_ROOT/package.json"
EXAMPLES_PATH="examples"

# Build lib
echo "Building lib..."
cd "$REPO_ROOT/$LIB_PATH"
npm run build

# Indicate examples build start
echo "Building examples..."
cd "$REPO_ROOT/$EXAMPLES_PATH"

# Set required env to build examples
echo "Setting env variables..."

export VITE_LIGHTWEIGHT_CHARTS_REACT_COMPONENTS_VERSION=$(jq -r .version $LIB_PACKAGE_JSON | sed 's/[^0-9.]//g')
echo "lighweight-charts-components-version: $VITE_LIGHTWEIGHT_CHARTS_REACT_COMPONENTS_VERSION"

export VITE_LIGHTWEIGHT_CHARTS_VERSION=$(
  jq -r '.dependencies["lightweight-charts"]' "$ROOT_PACKAGE_JSON" | sed 's/[^0-9.]//g'
)
echo "lightweight-charts-version: $VITE_LIGHTWEIGHT_CHARTS_VERSION"

export VITE_GITHUB_URL=$(jq -r .repository $LIB_PACKAGE_JSON)
echo "github-url: $VITE_GITHUB_URL"

npm run build
cd -
