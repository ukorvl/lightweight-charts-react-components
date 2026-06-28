import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");

export default defineConfig({
  resolve: {
    alias: {
      "@": path.join(repoRoot, "lib", "src"),
      "lightweight-charts-react-components": path.join(
        repoRoot,
        "lib",
        "src",
        "index.ts"
      ),
    },
  },
  test: {
    environment: "jsdom",
    include: ["docs/tests/**/*.test.{ts,tsx}"],
    globals: true,
    setupFiles: ["docs/tests/setup.ts"],
  },
});
