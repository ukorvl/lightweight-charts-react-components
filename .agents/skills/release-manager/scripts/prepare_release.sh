#!/bin/bash

set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

usage() {
  cat <<'EOF'
Usage: prepare_release.sh --repo <path> --bump <major|minor|patch> [--base-branch main] [--remote origin] [--skip-fetch] [--dry-run]
EOF
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: Required command '$1' is not available." >&2
    exit 1
  fi
}

read_package_version() {
  node --input-type=module -e '
    import { readFileSync } from "node:fs";

    const file = process.argv[1];
    const json = JSON.parse(readFileSync(file, "utf8"));
    if (!json.version) {
      console.error(`Error: Missing version field in ${file}`);
      process.exit(1);
    }
    process.stdout.write(String(json.version));
  ' "$1"
}

bump_version() {
  local version="$1"
  local bump="$2"

  if [[ ! "$version" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
    echo "Error: Unsupported version format '$version'." >&2
    exit 1
  fi

  local major="${BASH_REMATCH[1]}"
  local minor="${BASH_REMATCH[2]}"
  local patch="${BASH_REMATCH[3]}"

  case "$bump" in
    major)
      echo "$((major + 1)).0.0"
      ;;
    minor)
      echo "${major}.$((minor + 1)).0"
      ;;
    patch)
      echo "${major}.${minor}.$((patch + 1))"
      ;;
    *)
      echo "Error: Unsupported bump '$bump'." >&2
      exit 1
      ;;
  esac
}

ensure_clean_worktree() {
  if ! git -C "$1" diff --quiet || ! git -C "$1" diff --cached --quiet; then
    echo "Error: Release prep requires a clean worktree." >&2
    git -C "$1" status --short
    exit 1
  fi
}

switch_to_base_branch() {
  local repo_path="$1"
  local remote="$2"
  local base_branch="$3"

  if git -C "$repo_path" show-ref --verify --quiet "refs/heads/$base_branch"; then
    git -C "$repo_path" switch "$base_branch"
    return
  fi

  if git -C "$repo_path" show-ref --verify --quiet "refs/remotes/$remote/$base_branch"; then
    git -C "$repo_path" switch -c "$base_branch" "$remote/$base_branch"
    return
  fi

  echo "Error: Could not find base branch '$base_branch' locally or on $remote." >&2
  exit 1
}

switch_to_release_branch() {
  local repo_path="$1"
  local remote="$2"
  local release_branch="$3"
  local base_branch="$4"

  if [[ "$(git -C "$repo_path" branch --show-current)" == "$release_branch" ]]; then
    return
  fi

  if git -C "$repo_path" show-ref --verify --quiet "refs/heads/$release_branch"; then
    git -C "$repo_path" switch "$release_branch"
    return
  fi

  if git -C "$repo_path" show-ref --verify --quiet "refs/remotes/$remote/$release_branch"; then
    git -C "$repo_path" switch -c "$release_branch" "$remote/$release_branch"
    return
  fi

  git -C "$repo_path" switch -c "$release_branch" "$base_branch"
}

REPO_PATH=""
BUMP=""
BASE_BRANCH="main"
REMOTE="origin"
SKIP_FETCH=0
DRY_RUN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo)
      REPO_PATH="$2"
      shift 2
      ;;
    --bump)
      BUMP="$2"
      shift 2
      ;;
    --base-branch)
      BASE_BRANCH="$2"
      shift 2
      ;;
    --remote)
      REMOTE="$2"
      shift 2
      ;;
    --skip-fetch)
      SKIP_FETCH=1
      shift
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Error: Unknown argument '$1'." >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$REPO_PATH" || -z "$BUMP" ]]; then
  echo "Error: --repo and --bump are required." >&2
  usage
  exit 1
fi

if [[ "$BUMP" != "major" && "$BUMP" != "minor" && "$BUMP" != "patch" ]]; then
  echo "Error: --bump must be one of: major, minor, patch." >&2
  exit 1
fi

require_command git
require_command node
require_command npm

REPO_PATH=$(cd "$REPO_PATH" && pwd)
PACKAGE_JSON_PATH="$REPO_PATH/lib/package.json"

if [[ ! -f "$PACKAGE_JSON_PATH" ]]; then
  echo "Error: Expected $PACKAGE_JSON_PATH to exist." >&2
  exit 1
fi

BASE_VERSION=$(read_package_version "$PACKAGE_JSON_PATH")
TARGET_VERSION=$(bump_version "$BASE_VERSION" "$BUMP")
RELEASE_BRANCH="release-v$TARGET_VERSION"

if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "REPO_PATH=$REPO_PATH"
  echo "BASE_BRANCH=$BASE_BRANCH"
  echo "REMOTE=$REMOTE"
  echo "BASE_VERSION=$BASE_VERSION"
  echo "TARGET_VERSION=$TARGET_VERSION"
  echo "RELEASE_BRANCH=$RELEASE_BRANCH"
  exit 0
fi

ensure_clean_worktree "$REPO_PATH"

if [[ "$SKIP_FETCH" -eq 0 ]]; then
  git -C "$REPO_PATH" fetch "$REMOTE" "$BASE_BRANCH" --tags
fi

switch_to_base_branch "$REPO_PATH" "$REMOTE" "$BASE_BRANCH"

if [[ "$SKIP_FETCH" -eq 0 ]]; then
  git -C "$REPO_PATH" pull --ff-only "$REMOTE" "$BASE_BRANCH"
fi

BASE_VERSION=$(read_package_version "$PACKAGE_JSON_PATH")
TARGET_VERSION=$(bump_version "$BASE_VERSION" "$BUMP")
RELEASE_BRANCH="release-v$TARGET_VERSION"

switch_to_release_branch "$REPO_PATH" "$REMOTE" "$RELEASE_BRANCH" "$BASE_BRANCH"

BRANCH_VERSION=$(read_package_version "$PACKAGE_JSON_PATH")

if [[ "$BRANCH_VERSION" == "$TARGET_VERSION" ]]; then
  echo "Release branch $RELEASE_BRANCH already carries v$TARGET_VERSION."
elif [[ "$BRANCH_VERSION" == "$BASE_VERSION" ]]; then
  (
    cd "$REPO_PATH"
    npm run version -- "$BUMP"
  )
else
  echo "Error: Unexpected version on $RELEASE_BRANCH: $BRANCH_VERSION. Expected $BASE_VERSION or $TARGET_VERSION." >&2
  exit 1
fi

"$SCRIPT_DIR/check_versions_in_sync.sh" --repo "$REPO_PATH"

echo "RELEASE_BRANCH=$RELEASE_BRANCH"
echo "RELEASE_VERSION=$TARGET_VERSION"
