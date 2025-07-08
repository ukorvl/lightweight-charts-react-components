import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  mode: "benchmark",
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["tests/bench/setup.ts"],
    globals: true,
    benchmark: {
      include: ["tests/bench/**/*.bench.{ts,tsx}"],
      outputJson: "tests/bench/output/benchmark-results.json",
    },
  },
});
