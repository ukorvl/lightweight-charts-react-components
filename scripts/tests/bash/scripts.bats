#!/usr/bin/env bats
# Bats entrypoint for unit-testing repository shell scripts under `./scripts`.
# Inputs: Runs under Bats, sources `test_helper.bash`, and creates temporary fixture repos plus PATH stubs for external commands.
# Outputs: Verifies script exit codes, output text, and delegated command invocations without mutating the checked-out workspace.
# Important details: Exercises CLI behavior instead of sourcing full scripts directly because these scripts execute work at top level.

# shellcheck source=./scripts/tests/bash/test_helper.bash
source "$BATS_TEST_DIRNAME/test_helper.bash"

function check_command_succeeds_for_available_commands { #@test
  run bash -c "set -euo pipefail; SCRIPT_DIR='$REPO_ROOT/scripts'; source '$REPO_ROOT/scripts/common.sh'; check_command bash; printf 'ok\n'"

  # shellcheck disable=SC2154
  [ "$status" -eq 0 ]
  [ "$output" = "ok" ]
}

function check_command_fails_with_a_helpful_error_for_missing_commands { #@test
  run bash -c "set -euo pipefail; SCRIPT_DIR='$REPO_ROOT/scripts'; source '$REPO_ROOT/scripts/common.sh'; check_command command-that-does-not-exist"

  # shellcheck disable=SC2154
  [ "$status" -eq 1 ]
  assert_output_contains "Required command 'command-that-does-not-exist' is not installed or not in PATH."
}

function prepare_env_exports_versions_from_repo_metadata { #@test
  repo_dir="$(create_temp_dir)"
  stub_dir="$repo_dir/stubs"

  create_shell_fixture_repo "$repo_dir"
  populate_minimal_repo_metadata "$repo_dir"
  mkdir -p "$stub_dir"
  write_jq_stub "$stub_dir"

  run env PATH="$stub_dir:$PATH" bash "$repo_dir/scripts/prepare-env.sh"

  # shellcheck disable=SC2154
  [ "$status" -eq 0 ]
  assert_output_contains "lightweight-charts-components-version: 2.6.0"
  assert_output_contains "lightweight-charts-version: 5.2.0"
  assert_output_contains "github-url: git+https://example.test/lightweight-charts-react-components.git"
}

function build_all_builds_lib_before_examples { #@test
  repo_dir="$(create_temp_dir)"
  stub_dir="$repo_dir/stubs"
  stub_log="$repo_dir/npm.log"

  create_shell_fixture_repo "$repo_dir"
  populate_minimal_repo_metadata "$repo_dir"
  mkdir -p "$stub_dir"
  write_jq_stub "$stub_dir"
  write_executable "$stub_dir/npm" "$(cat <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

printf '%s|%s\n' "$PWD" "$*" >> "$STUB_LOG"
EOF
)"

  run env PATH="$stub_dir:$PATH" STUB_LOG="$stub_log" bash "$repo_dir/scripts/build-all.sh"

  # shellcheck disable=SC2154
  [ "$status" -eq 0 ]
  assert_output_contains "Setting env variables..."
  assert_output_contains "Building lib..."
  assert_output_contains "Building examples..."
  assert_output_contains "Building finished successfully."
  assert_file_contains "$stub_log" "$repo_dir/lib|run build"
  assert_file_contains "$stub_log" "$repo_dir/examples|run build"
}

function version_script_requires_a_version_argument { #@test
  repo_dir="$(create_temp_dir)"
  stub_dir="$repo_dir/stubs"

  create_shell_fixture_repo "$repo_dir"
  populate_minimal_repo_metadata "$repo_dir"
  mkdir -p "$stub_dir"
  write_noop_stub "$stub_dir" "jq"
  write_noop_stub "$stub_dir" "prettier"
  write_noop_stub "$stub_dir" "npm"
  write_noop_stub "$stub_dir" "perl"
  write_noop_stub "$stub_dir" "node"

  run env PATH="$stub_dir:$PATH" bash "$repo_dir/scripts/version.sh"

  # shellcheck disable=SC2154
  [ "$status" -eq 1 ]
  assert_output_contains "Usage:"
  assert_output_contains "[patch|minor|major]"
}

function version_script_rejects_unknown_version_types { #@test
  repo_dir="$(create_temp_dir)"
  stub_dir="$repo_dir/stubs"

  create_shell_fixture_repo "$repo_dir"
  populate_minimal_repo_metadata "$repo_dir"
  mkdir -p "$stub_dir"
  write_noop_stub "$stub_dir" "jq"
  write_noop_stub "$stub_dir" "prettier"
  write_noop_stub "$stub_dir" "npm"
  write_noop_stub "$stub_dir" "perl"
  write_noop_stub "$stub_dir" "node"

  run env PATH="$stub_dir:$PATH" bash "$repo_dir/scripts/version.sh" banana

  # shellcheck disable=SC2154
  [ "$status" -eq 1 ]
  assert_output_contains "Invalid argument 'banana'. Allowed values are: patch, minor, major."
}

function lint_commits_uses_the_pull_request_base_ref_and_unshallows_when_needed { #@test
  stub_dir="$(create_temp_dir)"
  stub_log="$(create_temp_dir)/commands.log"

  write_executable "$stub_dir/git" "$(cat <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

printf 'git %s\n' "$*" >> "$STUB_LOG"

if [[ "$1" == "rev-parse" && "$2" == "--is-shallow-repository" ]]; then
  printf '%s\n' 'true'
  exit 0
fi

if [[ "$1" == "fetch" && "$2" == "--unshallow" ]]; then
  exit 0
fi

if [[ "$1" == "rev-list" && "$2" == "--count" && "$3" == "origin/main..HEAD" ]]; then
  printf '%s\n' '3'
  exit 0
fi

if [[ "$1" == "rev-list" && "$2" == "--max-parents=0" && "$3" == "HEAD" ]]; then
  printf '%s\n' 'root-commit'
  exit 0
fi

if [[ "$1" == "rev-list" && "$2" == "--count" && "$3" == "HEAD" ]]; then
  printf '%s\n' '5'
  exit 0
fi

printf 'Unexpected git invocation: %s\n' "$*" >&2
exit 1
EOF
)"

  write_executable "$stub_dir/npx" "$(cat <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

printf 'npx %s\n' "$*" >> "$STUB_LOG"
EOF
)"

  run env PATH="$stub_dir:$PATH" STUB_LOG="$stub_log" COMMITLINT_FROM_REF="origin/main" bash "$REPO_ROOT/scripts/lint-commits.sh"

  # shellcheck disable=SC2154
  [ "$status" -eq 0 ]
  assert_output_contains "Repository is shallow. Fetching all commits..."
  assert_output_contains "Linting 3 commits..."
  assert_output_contains "Running Commitlint from origin/main to HEAD..."
  assert_output_contains "All commit messages are valid."
  assert_file_contains "$stub_log" "git fetch --unshallow"
  assert_file_contains "$stub_log" "npx commitlint --from=origin/main --to=HEAD"
}

function lint_commits_falls_back_to_the_full_branch_history_without_a_base_ref { #@test
  stub_dir="$(create_temp_dir)"
  stub_log="$(create_temp_dir)/commands.log"

  write_executable "$stub_dir/git" "$(cat <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

printf 'git %s\n' "$*" >> "$STUB_LOG"

if [[ "$1" == "rev-parse" && "$2" == "--is-shallow-repository" ]]; then
  printf '%s\n' 'false'
  exit 0
fi

if [[ "$1" == "rev-list" && "$2" == "--max-parents=0" && "$3" == "HEAD" ]]; then
  printf '%s\n' 'root-commit'
  exit 0
fi

if [[ "$1" == "rev-list" && "$2" == "--count" && "$3" == "HEAD" ]]; then
  printf '%s\n' '5'
  exit 0
fi

printf 'Unexpected git invocation: %s\n' "$*" >&2
exit 1
EOF
)"

  write_executable "$stub_dir/npx" "$(cat <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

printf 'npx %s\n' "$*" >> "$STUB_LOG"
EOF
)"

  run env PATH="$stub_dir:$PATH" STUB_LOG="$stub_log" bash "$REPO_ROOT/scripts/lint-commits.sh"

  # shellcheck disable=SC2154
  [ "$status" -eq 0 ]
  assert_output_contains "Linting 5 commits..."
  assert_output_contains "Running Commitlint from root-commit to HEAD..."
  assert_file_contains "$stub_log" "npx commitlint --from=root-commit --to=HEAD"
}
