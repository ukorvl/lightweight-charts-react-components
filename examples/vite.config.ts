import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import viteCompression from "vite-plugin-compression";
import path from "node:path";

const env = loadEnv("", process.cwd());

export default defineConfig({
  server: {
    port: Number(process.env.PORT) || 5173,
  },
  plugins: [react(), viteCompression()],
  build: {
    emptyOutDir: true,
    sourcemap: true,
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "./index.html",
      },
    },
    copyPublicDir: true,
  },
  base: env.VITE_BASE_URL || "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
