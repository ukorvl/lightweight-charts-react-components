#!/usr/bin/env bash
# Shared helper library for Bats tests covering repository-maintained shell scripts.
# Inputs: Sourced by shell test entrypoints, relies on `BATS_TEST_TMPDIR`, and accepts fixture paths, filenames, and stub command definitions.
# Outputs: Creates disposable fixture repos, writes executable stubs and metadata files, and exposes assertion helpers for Bats test cases.
# Important details: Copies repo scripts into temp fixtures so tests can safely stub external commands via PATH and avoid mutating workspace files.

set -euo pipefail

TEST_HELPER_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
REPO_ROOT=$(cd -- "$TEST_HELPER_DIR/../../.." &>/dev/null && pwd)

create_temp_dir() {
  mktemp -d "${BATS_TEST_TMPDIR}/shell-scripts-XXXXXX"
}


create_shell_fixture_repo() {
  local repo_dir="$1"

  mkdir -p "$repo_dir/.github"
  cp -R "$REPO_ROOT/scripts" "$repo_dir/scripts"
  cp -R "$REPO_ROOT/.github/scripts" "$repo_dir/.github/scripts"
  mkdir -p "$repo_dir/lib/src" "$repo_dir/examples"
}

write_file() {
  local file_path="$1"
  local contents="$2"

  mkdir -p "$(dirname "$file_path")"
  printf "%s" "$contents" > "$file_path"
}

populate_minimal_repo_metadata() {
  local repo_dir="$1"

  write_file "$repo_dir/package.json" "$(cat <<'EOF'
{
  "dependencies": {
    "lightweight-charts": "^5.2.0"
  }
}
EOF
)"

  write_file "$repo_dir/lib/package.json" "$(cat <<'EOF'
{
  "version": "2.6.0",
  "repository": {
    "url": "git+https://example.test/lightweight-charts-react-components.git"
  }
}
EOF
)"

  write_file "$repo_dir/lib/jsr.json" "$(cat <<'EOF'
{
  "version": "2.6.0"
}
EOF
)"

  write_file "$repo_dir/lib/README.md" "Placeholder README for shell tests.
"
  write_file "$repo_dir/lib/src/version.ts" "export const version = '2.6.0';
"
}

write_executable() {
  local file_path="$1"
  local contents="$2"

  write_file "$file_path" "$contents"
  chmod +x "$file_path"
}

write_noop_stub() {
  local stub_dir="$1"
  local command_name="$2"

  cat <<'EOF' > "$stub_dir/$command_name"
#!/usr/bin/env bash
set -euo pipefail
EOF
  chmod +x "$stub_dir/$command_name"
}

write_jq_stub() {
  local stub_dir="$1"

  cat <<'EOF' > "$stub_dir/jq"
#!/usr/bin/env bash
set -euo pipefail

query="$2"

case "$query" in
  .version)
    printf '%s\n' '2.6.0'
    ;;
  '.dependencies["lightweight-charts"]')
    printf '%s\n' '^5.2.0'
    ;;
  .repository.url)
    printf '%s\n' 'git+https://example.test/lightweight-charts-react-components.git'
    ;;
  *)
    printf 'Unexpected jq query: %s\n' "$query" >&2
    exit 1
    ;;
esac
EOF
  chmod +x "$stub_dir/jq"
}

assert_output_contains() {
  local expected="$1"
  # shellcheck disable=SC2154
  [[ "$output" == *"$expected"* ]]
}

assert_file_contains() {
  local file_path="$1"
  local expected="$2"

  grep -F "$expected" "$file_path" >/dev/null
}
