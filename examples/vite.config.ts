import path from "node:path";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import bundlesize from "vite-plugin-bundlesize";
import { capo } from "vite-plugin-capo";
import checker from "vite-plugin-checker";
import circleDependency from "vite-plugin-circular-dependency";
import viteCompression from "vite-plugin-compression";
import htmlPlugin, { type Options } from "vite-plugin-html-config";
import { VitePWA } from "vite-plugin-pwa";
import sitemapPlugin from "vite-plugin-sitemap";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { homepage, description } from "./package.json";
import type { UserConfigFn } from "vite";

const env = loadEnv("", process.cwd(), "");

const fontHref =
  "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Roboto+Mono:ital,wght@0,300..700;1,300..700&display=swap";

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
      property: "og:title",
      content: env.VITE_APP_DEFAULT_TITLE,
    },
    {
      property: "og:description",
      content: description,
    },
    {
      property: "og:url",
      content: homepage,
    },
    {
      property: "og:image",
      content: `${homepage}/og.jpg`,
    },
    {
      property: "og:type",
      content: "website",
    },
    {
      property: "og:image:alt",
      content: env.VITE_APP_DEFAULT_TITLE,
    },
    {
      property: "og:locale",
      content: "en_US",
    },
    {
      property: "og:site_name",
      content: env.VITE_APP_DEFAULT_TITLE,
    },
    {
      property: "og:image:width",
      content: "1200",
    },
    {
      property: "og:image:height",
      content: "630",
    },
    {
      name: "google-site-verification",
      content: env.VITE_GOOGLE_SITE_VERIFICATION || "",
    },
  ],
  links: [
    {
      rel: "icon",
      sizes: "any",
      href: `${env.VITE_BASE_URL}/favicon.ico`,
    },
    {
      rel: "icon",
      type: "image/svg+xml",
      href: `${env.VITE_GITHUB_STATIC_ASSETS_BASE_URL}/logo.svg`,
    },
    // Tells browser to establish TLS as early as possible
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "true",
    },
    // Preload the font and act like a style in order not to block rendering while the font is loading
    {
      rel: "preload",
      as: "style",
      href: fontHref,
    },
    // Reuses the preloaded font and applies it to the document avoiding blocking while the font is loading
    {
      rel: "stylesheet",
      href: fontHref,
      media: "all",
    },
    // Preconnect to images CDN
    {
      rel: "preconnect",
      href: env.VITE_GITHUB_STATIC_ASSETS_BASE_URL,
      crossOrigin: "true",
    },
  ],
};

const getUserConfig: UserConfigFn = ({ command }) => ({
  server: {
    port: Number(env.PORT) || 5173,
  },
  plugins: [
    react(),
    viteCompression(),
    htmlPlugin(htmlConfig),
    circleDependency(),
    ...(command === "build"
      ? [
          checker({
            typescript: true,
          }),
        ]
      : []),
    bundlesize({
      limits: [
        {
          name: "**/*",
          limit: "500 kB",
        },
      ],
    }),
    sitemapPlugin({
      hostname: homepage,
      dynamicRoutes: ["/terminal", "/docs"],
      exclude: ["/404"],
      basePath: env.VITE_BASE_URL,
      changefreq: "daily",
      priority: 1,
      readable: true,
    }),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
        navigateFallbackDenylist: [/sitemap\.xml$/, /robots\.txt$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/.*\.svg$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: { maxEntries: 1000, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\/sitemap\.xml$/,
            handler: "NetworkOnly",
            options: {
              cacheName: "sitemap-no-cache",
            },
          },
          {
            urlPattern: /\/robots\.txt$/,
            handler: "NetworkOnly",
            options: {
              cacheName: "robots-no-cache",
            },
          },
          {
            urlPattern: /^https:\/\/api\.github\.com\/repos\/[^/]+\/[^/]+$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "github-api",
              expiration: {
                maxAgeSeconds: 60 * 60 * 24,
                maxEntries: 10,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: false,
    }),
    ...(command === "build"
      ? [
          viteStaticCopy({
            targets: [
              {
                src: "dist/index.html",
                dest: ".",
                rename: "404.html",
              },
            ],
          }),
        ]
      : []),
    capo(),
  ],
  build: {
    emptyOutDir: true,
    sourcemap: true,
    outDir: "dist",
    rollupOptions: {
      input: "./index.html",
    },
    copyPublicDir: true,
    assetsInlineLimit: 8192,
  },
  base: env.VITE_BASE_URL,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  preview: {
    port: 4173,
  },
});

export default getUserConfig;
