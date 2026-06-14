#!/usr/bin/env bash

# This script prepares the environment variables needed for building examples

set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
source "$SCRIPT_DIR/common.sh"

check_command jq

VITE_LIGHTWEIGHT_CHARTS_REACT_COMPONENTS_VERSION=$(
  jq -r .version "$LIB_PACKAGE_JSON" | sed 's/[^0-9.]//g'
)
export VITE_LIGHTWEIGHT_CHARTS_REACT_COMPONENTS_VERSION
echo "lightweight-charts-components-version: $VITE_LIGHTWEIGHT_CHARTS_REACT_COMPONENTS_VERSION"

VITE_LIGHTWEIGHT_CHARTS_VERSION=$(
  jq -r '.dependencies["lightweight-charts"]' "$ROOT_PACKAGE_JSON" | sed 's/[^0-9.]//g'
)
export VITE_LIGHTWEIGHT_CHARTS_VERSION
echo "lightweight-charts-version: $VITE_LIGHTWEIGHT_CHARTS_VERSION"

VITE_GITHUB_URL=$(jq -r .repository.url "$LIB_PACKAGE_JSON")
export VITE_GITHUB_URL
echo "github-url: $VITE_GITHUB_URL"
