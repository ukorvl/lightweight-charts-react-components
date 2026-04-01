import { spawnSync } from "node:child_process";
import { Resolver } from "node:dns/promises";
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const denoProjectDir = process.env.DENO_TEST_PROJECT_DIR;

if (!denoProjectDir) {
  throw new Error("DENO_TEST_PROJECT_DIR is not defined");
}

const denoConfigPath = path.join(denoProjectDir, "deno.json");
const denoEntryPath = path.join(denoProjectDir, "main.ts");
const denoEntryFixturePath = new URL("./main.ts", import.meta.url);
const denoLocalPackagePath = new URL("../../src/index.ts", import.meta.url).href;
const denoLocalSourceDirPath = new URL("../../src/", import.meta.url).href;

const DENO_DNS_LOOKUP_TIMEOUT_MS = 3000;
const DENO_SPAWN_TIMEOUT_MS = 120000;
const DENO_TEST_TIMEOUT_MS = DENO_SPAWN_TIMEOUT_MS + 5000;
const DENO_NETWORK_HOSTNAMES = ["registry.npmjs.org"] as const;
const DENO_JSR_CONFIG_PATH = new URL("../../jsr.json", import.meta.url);

const jsrConfig = JSON.parse(readFileSync(DENO_JSR_CONFIG_PATH, "utf8"));
const DENO_REACT_IMPORT = pinNpmImport(jsrConfig.imports?.react, "react");
const DENO_REACT_DOM_IMPORT = pinNpmImport(jsrConfig.imports?.["react-dom"], "react-dom");
const DENO_LIGHTWEIGHT_CHARTS_IMPORT = pinNpmImport(
  jsrConfig.imports?.["lightweight-charts"],
  "lightweight-charts"
);

async function hasDnsAccess(hostname: string): Promise<boolean> {
  const resolver = new Resolver();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    const resolvePromise = Promise.any([
      resolver.resolve4(hostname),
      resolver.resolve6(hostname),
    ])
      .then(() => true)
      .catch(() => false);
    const timeoutPromise = new Promise<false>(resolve => {
      timeoutId = setTimeout(() => {
        resolver.cancel();
        resolve(false);
      }, DENO_DNS_LOOKUP_TIMEOUT_MS);
      timeoutId.unref?.();
    });

    return await Promise.race([resolvePromise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    resolver.cancel();
  }
}

function pinNpmImport(importValue: string | undefined, packageName: string): string {
  if (!importValue) {
    throw new Error(`Missing ${packageName} import in jsr.json`);
  }

  const prefix = `npm:${packageName}@`;

  if (!importValue.startsWith(prefix)) {
    throw new Error(`Unexpected ${packageName} import in jsr.json: ${importValue}`);
  }

  const version = importValue.slice(prefix.length);

  if (/^[~^]/.test(version)) {
    return `${prefix}${version.slice(1)}`;
  }

  return importValue;
}

const hasDenoNetworkAccess = await Promise.all(
  DENO_NETWORK_HOSTNAMES.map(hostname => hasDnsAccess(hostname))
).then(results => results.every(Boolean));

writeFileSync(
  denoConfigPath,
  JSON.stringify(
    {
      imports: {
        react: DENO_REACT_IMPORT,
        "react/": `${DENO_REACT_IMPORT}/`,
        "react-dom": DENO_REACT_DOM_IMPORT,
        "lightweight-charts": DENO_LIGHTWEIGHT_CHARTS_IMPORT,
        "@/": denoLocalSourceDirPath,
        "lightweight-charts-react-components": denoLocalPackagePath,
      },
    },
    null,
    2
  )
);

copyFileSync(denoEntryFixturePath, denoEntryPath);

describe("Deno e2e", () => {
  test.skipIf(!hasDenoNetworkAccess)(
    "resolves local package source in a Deno project",
    () => {
      const result = spawnSync(
        "deno",
        ["run", "--sloppy-imports", "--allow-net", "--allow-env=NODE_ENV", denoEntryPath],
        {
          cwd: denoProjectDir,
          encoding: "utf8",
          timeout: DENO_SPAWN_TIMEOUT_MS,
          env: {
            ...process.env,
            DENO_TLS_CA_STORE: "system",
          },
        }
      );
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");

      expect(result.error).toBeUndefined();

      if (result.status !== 0) {
        throw new Error(output || `Deno process failed with exit code ${result.status}`);
      }

      expect(output).toContain("ok");
    },
    DENO_TEST_TIMEOUT_MS
  );
});
