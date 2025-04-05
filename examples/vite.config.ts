import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import viteCompression from "vite-plugin-compression";
import path from "node:path";
import htmlPlugin, { type Options } from "vite-plugin-html-config";
import { homepage, description } from "./package.json";

const env = loadEnv("", process.cwd(), "");

export const htmlConfig: Options = {
  title: env.VITE_APP_DEFAULT_TITLE,
  metas: [
    {
      charset: "utf-8",
    },
    {
      name: "description",
      content: "Examples of lightweight-charts-react-components usage",
    },
    {
      name: "keywords",
      content:
        "lightweight-charts, react, examples, charts, visualization, react components",
    },
    {
      name: "author",
      content: "ukorvl",
    },
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1.0",
    },
    {
      name: "category",
      content: "technology",
    },
    {
      name: "robots",
      content: "index, follow",
    },
    {
      name: "googlebot",
      content: "index, follow",
    },
    {
      name: "twitter:card",
      content: "summary_large_image",
    },
    {
      name: "twitter:domain",
      content: new URL(homepage).hostname,
    },
    {
      name: "twitter:url",
      content: homepage,
    },
    {
      name: "twitter:title",
      content: env.VITE_APP_DEFAULT_TITLE,
    },
    {
      name: "twitter:description",
      content: description,
    },
    {
      name: "twitter:image",
      content: `${homepage}/og.jpg`,
    },
    {
      name: "og:title",
      content: env.VITE_APP_DEFAULT_TITLE,
    },
    {
      name: "og:description",
      content: description,
    },
    {
      name: "og:url",
      content: homepage,
    },
    {
      name: "og:image",
      content: `${homepage}/og.jpg`,
    },
    {
      name: "og:type",
      content: "website",
    },
    {
      name: "og:image:alt",
      content: env.VITE_APP_DEFAULT_TITLE,
    },
    {
      name: "og:locale",
      content: "en_US",
    },
    {
      name: "og:site_name",
      content: env.VITE_APP_DEFAULT_TITLE,
    },
    {
      name: "og:image:width",
      content: "1200",
    },
    {
      name: "og:image:height",
      content: "630",
    },
  ],
  links: [
    {
      rel: "icon",
      type: "image/svg+xml",
      href: `${env.VITE_BASE_URL}/icon.svg`,
    },
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "true",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap",
    },
  ],
};

export default defineConfig({
  server: {
    port: Number(env.PORT) || 5173,
  },
  plugins: [react(), viteCompression(), htmlPlugin(htmlConfig)],
  build: {
    emptyOutDir: true,
    sourcemap: true,
    outDir: "dist",
    rollupOptions: {
      input: "./index.html",
    },
    copyPublicDir: true,
  },
  base: env.VITE_BASE_URL,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
