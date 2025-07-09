import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["tests/standalone/**/*.test.{ts,tsx}"],
    globals: true,
    setupFiles: ["tests/standalone/setup.ts"],
  },
});
