import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/deno/**/*.test.{ts,tsx}"],
    globals: true,
    setupFiles: ["tests/deno/setup.ts"],
  },
});
