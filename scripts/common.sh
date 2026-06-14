#!/bin/bash

# Utility functions and common variables for bash scripts

set -euo pipefail

REPO_ROOT="$SCRIPT_DIR/.."
LIB_PATH="lib"
LIB_PACKAGE_JSON="$REPO_ROOT/$LIB_PATH/package.json"
ROOT_PACKAGE_JSON="$REPO_ROOT/package.json"
EXAMPLES_PATH="examples"

# Checks if a command is available in the system PATH
check_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "❌ Error: Required command '$1' is not installed or not in PATH." >&2
    exit 1
  fi
}
