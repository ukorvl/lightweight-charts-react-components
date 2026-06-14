#!/usr/bin/env bash

# This script checks out the base branch of the library, runs unit tests with coverage, and copies the resulting coverage summary to a separate folder for later comparison with the current branch's coverage.

set -euo pipefail

BASE_REF="${1:?Base ref is required}"
REPO_ROOT="$(git rev-parse --show-toplevel)"
BASE_DIR="$(mktemp -d "${RUNNER_TEMP:-/tmp}/lib-coverage-base-XXXXXX")"

cleanup() {
  git -C "$REPO_ROOT" worktree remove --force "$BASE_DIR" >/dev/null 2>&1 || true
}

trap cleanup EXIT

git -C "$REPO_ROOT" fetch --no-tags --depth=1 origin "${BASE_REF}:refs/remotes/origin/${BASE_REF}"
git -C "$REPO_ROOT" worktree add --detach "$BASE_DIR" "origin/${BASE_REF}"

pushd "$BASE_DIR" >/dev/null
npm ci --ignore-scripts --audit=false

pushd lib >/dev/null
export CI=true
npm run test:unit -- --run
popd >/dev/null
popd >/dev/null

mkdir -p "$REPO_ROOT/lib/coverage-base"
cp \
  "$BASE_DIR/lib/coverage/coverage-summary.json" \
  "$REPO_ROOT/lib/coverage-base/coverage-summary.json"
