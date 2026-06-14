#!/usr/bin/env bash

# This script runs benchmarks on two different checkouts of the library, compares the results, and generates a report.

set -euo pipefail

BASE_DIR_INPUT="${BASE_DIR:?BASE_DIR is required}"
CURRENT_DIR_INPUT="${CURRENT_DIR:?CURRENT_DIR is required}"
OUTPUT_DIR_INPUT="${OUTPUT_DIR:?OUTPUT_DIR is required}"
REPORT_PATH_INPUT="${REPORT_PATH:?REPORT_PATH is required}"
BENCH_RUNS_VALUE="${BENCH_RUNS:?BENCH_RUNS is required}"
RELATIVE_THRESHOLD_VALUE="${RELATIVE_THRESHOLD:?RELATIVE_THRESHOLD is required}"
MIN_ABSOLUTE_MS_VALUE="${MIN_ABSOLUTE_MS:?MIN_ABSOLUTE_MS is required}"
MAX_CV_VALUE="${MAX_CV:?MAX_CV is required}"
BASE_LABEL_VALUE="${BASE_LABEL:?BASE_LABEL is required}"
CURRENT_LABEL_VALUE="${CURRENT_LABEL:?CURRENT_LABEL is required}"

if ! [[ "$BENCH_RUNS_VALUE" =~ ^[0-9]+$ ]] || [ "$BENCH_RUNS_VALUE" -lt 1 ]; then
  echo "BENCH_RUNS must be a positive integer" >&2
  exit 1
fi

REPO_ROOT="$(git rev-parse --show-toplevel)"
REPO_ROOT_REAL="$(python3 -c 'from pathlib import Path; import sys; print(Path(sys.argv[1]).resolve(strict=False))' "$REPO_ROOT")"

resolve_path() {
  local raw_path="$1"
  local label="$2"
  local resolved_path

  if [[ -z "$raw_path" ]]; then
    echo "${label} must not be empty" >&2
    exit 1
  fi

  if [[ "$raw_path" = /* ]]; then
    echo "${label} must be relative to the repository root, got absolute path: ${raw_path}" >&2
    exit 1
  fi

  resolved_path="$(python3 -c 'from pathlib import Path; import sys; print(Path(sys.argv[1]).resolve(strict=False))' "$REPO_ROOT_REAL/$raw_path")"

  case "$resolved_path" in
    "$REPO_ROOT_REAL"|"$REPO_ROOT_REAL"/*)
      printf '%s\n' "$resolved_path"
      ;;
    *)
      echo "${label} resolves outside the repository root: ${raw_path}" >&2
      exit 1
      ;;
  esac
}

BASE_DIR_ABS="$(resolve_path "$BASE_DIR_INPUT" "BASE_DIR")"
CURRENT_DIR_ABS="$(resolve_path "$CURRENT_DIR_INPUT" "CURRENT_DIR")"
OUTPUT_DIR_ABS="$(resolve_path "$OUTPUT_DIR_INPUT" "OUTPUT_DIR")"
REPORT_PATH_ABS="$(resolve_path "$REPORT_PATH_INPUT" "REPORT_PATH")"

mkdir -p "$OUTPUT_DIR_ABS/base" "$OUTPUT_DIR_ABS/current"

run_benchmarks() {
  local label="$1"
  local checkout_dir="$2"
  local result_dir="$3"

  echo "Installing dependencies for ${label} benchmark checkout"
  pushd "$checkout_dir" >/dev/null
  npm ci --ignore-scripts --audit=false

  echo "Building ${label} benchmark checkout"
  npm run build

  pushd lib >/dev/null
  export CI=true

  for run_index in $(seq 1 "$BENCH_RUNS_VALUE"); do
    local output_path="${result_dir}/run-${run_index}.json"
    echo "Running ${label} benchmarks (${run_index}/${BENCH_RUNS_VALUE})"
    BENCH_OUTPUT="$output_path" npm run test:unit:bench -- --run
  done

  popd >/dev/null
  popd >/dev/null
}

run_benchmarks "base" "$BASE_DIR_ABS" "$OUTPUT_DIR_ABS/base"
run_benchmarks "current" "$CURRENT_DIR_ABS" "$OUTPUT_DIR_ABS/current"

node "$REPO_ROOT/scripts/compare-benchmarks.mts" \
  --base "$OUTPUT_DIR_ABS/base" \
  --current "$OUTPUT_DIR_ABS/current" \
  --threshold "$RELATIVE_THRESHOLD_VALUE" \
  --min-absolute-ms "$MIN_ABSOLUTE_MS_VALUE" \
  --max-cv "$MAX_CV_VALUE" \
  --output "$REPORT_PATH_ABS" \
  --base-label "$BASE_LABEL_VALUE" \
  --current-label "$CURRENT_LABEL_VALUE"
