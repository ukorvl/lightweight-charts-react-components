import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["json", "text", "lcov", "json-summary"],
      include: ["src/**/*.{ts,tsx}"],
      reportsDirectory: "coverage",
      exclude: ["**/index.{ts,tsx}", "**/types.{ts,tsx}"],
      thresholds: {
        global: {
          statements: 95,
          branches: 95,
          functions: 95,
          lines: 95,
        },
      },
    },
    setupFiles: ["@testing-library/jest-dom"],
  },
});
