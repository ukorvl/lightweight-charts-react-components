import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["tests/readme/**/*.test.{ts,tsx}"],
    globals: true,
    setupFiles: ["tests/readme/setup.ts"],
    forceRerunTriggers: [
      "README.md",
      "tests/readme/extracted-snippets/*.tsx",
      "tests/readme/utils.ts",
    ],
  },
});
