#!/bin/bash

set -euo pipefail

# This wrapper keeps the release-manager skill aligned with the repository source-of-truth version sync checker.

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
REPO_ROOT=$(cd -- "$SCRIPT_DIR/../../../.." && pwd)

node "$REPO_ROOT/scripts/check-versions-in-sync.mts" "$@"
