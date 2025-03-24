import type { UserConfig } from "@commitlint/types";

const Configuration = {
  extends: ["@commitlint/config-conventional"],
  formatter: "@commitlint/format",
  rules: {
    "header-max-length": [2, "always", 72],
    "subject-case": [2, "always", ["sentence-case", "lower-case"]],
    "subject-full-stop": [2, "never", "."],
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "test",
        "chore",
        "perf",
        "ci",
        "revert",
      ],
    ],
    "type-case": [2, "always", "lower-case"],
    "body-max-line-length": [0],
  },
  helpUrl:
    "https://github.com/conventional-changelog/commitlint/#what-is-commitlint",
} satisfies UserConfig;

export default Configuration;
