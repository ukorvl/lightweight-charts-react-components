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
      reporter: ["json", "text", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      reportsDirectory: "coverage",
    },
    setupFiles: ["@testing-library/jest-dom"],
  },
});
