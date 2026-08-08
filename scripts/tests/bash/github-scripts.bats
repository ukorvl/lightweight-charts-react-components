#!/usr/bin/env bats
# Bats entrypoint for unit-testing repository shell scripts under `./.github/scripts`.
# Inputs: Runs under Bats, sources `test_helper.bash`, and provisions temporary fixture repos, temp directories, and stubbed executables.
# Outputs: Verifies GitHub automation script validation, worktree orchestration, and benchmark argument handling without touching CI state.
# Important details: Uses PATH-based command stubs so tests stay fast and deterministic even for scripts that normally call git, npm, and mktemp-heavy flows.

# shellcheck source=./scripts/tests/bash/test_helper.bash
source "$BATS_TEST_DIRNAME/test_helper.bash"

function prepare_base_lib_coverage_checks_out_the_base_worktree_and_copies_the_summary { #@test
  repo_dir="$(create_temp_dir)"
  stub_dir="$repo_dir/stubs"
  stub_log="$repo_dir/commands.log"

  create_shell_fixture_repo "$repo_dir"
  mkdir -p "$stub_dir" "$repo_dir/tmp" "$repo_dir/lib"

  write_executable "$stub_dir/git" "$(cat <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

args=("$@")
repo_dir=""

if [[ "${args[0]}" == "-C" ]]; then
  repo_dir="${args[1]}"
  args=("${args[@]:2}")
fi

printf 'git %s\n' "${args[*]}" >> "$STUB_LOG"

if [[ "${args[0]}" == "rev-parse" && "${args[1]}" == "--show-toplevel" ]]; then
  printf '%s\n' "${repo_dir:-$FIXTURE_REPO_ROOT}"
  exit 0
fi

if [[ "${args[0]}" == "fetch" ]]; then
  exit 0
fi

if [[ "${args[0]}" == "worktree" && "${args[1]}" == "add" ]]; then
  base_dir="${args[3]}"
  mkdir -p "$base_dir/lib/coverage"
  printf '%s\n' '{"total":{"lines":{"pct":95}}}' > "$base_dir/lib/coverage/coverage-summary.json"
  exit 0
fi

if [[ "${args[0]}" == "worktree" && "${args[1]}" == "remove" ]]; then
  exit 0
fi

printf 'Unexpected git invocation: %s\n' "${args[*]}" >&2
exit 1
EOF
)"

  write_executable "$stub_dir/npm" "$(cat <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

printf '%s|%s\n' "$PWD" "$*" >> "$STUB_LOG"
EOF
)"

  run env PATH="$stub_dir:$PATH" RUNNER_TEMP="$repo_dir/tmp" STUB_LOG="$stub_log" FIXTURE_REPO_ROOT="$repo_dir" bash "$repo_dir/.github/scripts/prepare-base-lib-coverage.sh" main

  # shellcheck disable=SC2154
  [ "$status" -eq 0 ]
  [ -f "$repo_dir/lib/coverage-base/coverage-summary.json" ]
  assert_file_contains "$repo_dir/lib/coverage-base/coverage-summary.json" '"pct":95'
  assert_file_contains "$stub_log" "git fetch --no-tags --depth=1 origin main:refs/remotes/origin/main"
  assert_file_contains "$stub_log" "git worktree add --detach"
  assert_file_contains "$stub_log" "|ci --ignore-scripts --audit=false"
  assert_file_contains "$stub_log" "|run test:unit -- --run"
}

function run_benchmark_comparison_rejects_invalid_bench_run_counts { #@test
  run env \
    BASE_DIR="base" \
    CURRENT_DIR="current" \
    OUTPUT_DIR="output" \
    REPORT_PATH="report.md" \
    BENCH_RUNS="0" \
    RELATIVE_THRESHOLD="0.1" \
    MIN_ABSOLUTE_MS="1" \
    MAX_CV="0.2" \
    BASE_LABEL="base" \
    CURRENT_LABEL="current" \
    bash "$REPO_ROOT/.github/scripts/run-benchmark-comparison.sh"

  # shellcheck disable=SC2154
  [ "$status" -eq 1 ]
  assert_output_contains "BENCH_RUNS must be a positive integer"
}
