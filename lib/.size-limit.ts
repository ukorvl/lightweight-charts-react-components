import type { SizeLimitConfig } from "size-limit";

export default [
  {
    name: "ESM",
    path: "dist/lightweight-charts-react-components.mjs",
    // The limit should be little more than the actual size to avoid false positives due to minor changes in dependencies or build output
    // The purpose of this limit is to catch significant bundle size increases
    // It should be adjusted manually when new changes arrive
    limit: "4 kB",
    import: "*",
    brotli: true,
  },
] satisfies SizeLimitConfig;
