import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    globals: true,
    coverage: {
      reportsDirectory: "./test/coverage",
      provider: "v8",
      reportOnFailure: true,
    },
  },
});
