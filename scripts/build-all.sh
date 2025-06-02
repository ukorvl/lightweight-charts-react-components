#!/bin/bash

# This script builds the lib and examples

set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
REPO_ROOT="$SCRIPT_DIR/.."
LIB_PATH="lib"

echo -e "Setting env variables...\n"
source "$SCRIPT_DIR/prepare-env.sh"

echo -e "\nBuilding lib..."
cd "$REPO_ROOT/$LIB_PATH"
npm run build

echo "Building examples..."
cd "$REPO_ROOT/$EXAMPLES_PATH"
npm run build
cd -

echo "Building finished successfully."
