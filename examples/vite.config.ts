import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    port: Number(process.env.PORT) || 5173,
  },
  plugins: [react()],
  build: {
    emptyOutDir: true,
    sourcemap: true,
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "./index.html",
      }
    },
  },
});
