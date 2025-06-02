#!/usr/bin/env bash

# This script prepares the environment variables needed for building examples

set -e pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
REPO_ROOT="$SCRIPT_DIR/.."
LIB_PACKAGE_JSON="$REPO_ROOT/lib/package.json"
ROOT_PACKAGE_JSON="$REPO_ROOT/package.json"
EXAMPLES_PATH="examples"

export VITE_LIGHTWEIGHT_CHARTS_REACT_COMPONENTS_VERSION=$(jq -r .version $LIB_PACKAGE_JSON | sed 's/[^0-9.]//g')
echo "lighweight-charts-components-version: $VITE_LIGHTWEIGHT_CHARTS_REACT_COMPONENTS_VERSION"

export VITE_LIGHTWEIGHT_CHARTS_VERSION=$(
  jq -r '.dependencies["lightweight-charts"]' "$ROOT_PACKAGE_JSON" | sed 's/[^0-9.]//g'
)
echo "lightweight-charts-version: $VITE_LIGHTWEIGHT_CHARTS_VERSION"

export VITE_GITHUB_URL=$(jq -r .repository $LIB_PACKAGE_JSON)
echo "github-url: $VITE_GITHUB_URL"
