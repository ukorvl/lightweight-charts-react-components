import type { SizeLimitConfig } from "size-limit";

export default [
  {
    name: "ESM",
    path: "dist/lightweight-charts-react-components.mjs",
    limit: "3.5 kB",
    import: "*",
    brotli: true,
  },
] satisfies SizeLimitConfig;
