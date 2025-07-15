import packageJson from "./package.json" with { type: "json" };
import type { SizeLimitConfig } from "size-limit";

export default [
  {
    name: "ESM",
    path: packageJson.module,
    limit: "3.5 kB",
    import: "*",
    brotli: true,
  },
  {
    name: "UMD",
    path: packageJson.unpkg,
    limit: "8 kB",
    import: "*",
    brotli: true,
  },
] satisfies SizeLimitConfig;
