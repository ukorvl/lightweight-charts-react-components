import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { createServer } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { ChildProcess } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const samplesDir = path.join(__dirname, "../..", "src/samples");

const sandboxDirs = readdirSync(samplesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => path.join(samplesDir, dirent.name, "sandbox"))
  .filter(sandboxDir => existsSync(path.join(sandboxDir, "package.json")));

const localHost = "127.0.0.1";
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const renderSettleTimeMs = 1000;
const serverPollIntervalMs = 250;
const processStopTimeoutMs = 5_000;

const delay = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getAvailablePort = async () => {
  return new Promise<number>((resolve, reject) => {
    const server = createServer();
    server.listen(0, localHost, () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("Failed to get available port"));
        return;
      }
      server.close(() => resolve(address.port));
    });
    server.on("error", reject);
  });
};

const waitForServer = async (
  url: string,
  serverProcess: ChildProcess,
  timeoutMs = 30_000
) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (serverProcess.exitCode !== null) {
      throw new Error(
        `Sandbox dev server exited early with code ${serverProcess.exitCode}`
      );
    }

    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Ignore errors while polling.
    }

    await delay(serverPollIntervalMs);
  }

  throw new Error(`Sandbox dev server did not start within ${timeoutMs}ms`);
};

const stopProcess = async (serverProcess: ChildProcess) => {
  if (serverProcess.exitCode !== null) {
    return;
  }

  serverProcess.kill("SIGTERM");

  const stopped = await Promise.race([
    new Promise<boolean>(resolve => serverProcess.once("exit", () => resolve(true))),
    delay(processStopTimeoutMs).then(() => false),
  ]);

  if (!stopped && serverProcess.exitCode === null) {
    serverProcess.kill("SIGKILL");
  }
};

test.describe("Sandbox samples", () => {
  test.describe.configure({ mode: "serial" });

  for (const sandboxDir of sandboxDirs) {
    const sampleName = path.basename(path.dirname(sandboxDir));

    test(`${sampleName} renders without console errors`, async ({ page }) => {
      const port = await getAvailablePort();
      const url = `http://${localHost}:${port}`;
      const serverProcess = spawn(
        npmCommand,
        ["run", "dev", "--", "--host", localHost, "--port", String(port), "--strictPort"],
        {
          cwd: sandboxDir,
          stdio: "ignore",
        }
      );

      const errors: string[] = [];
      page.on("console", message => {
        if (message.type() === "error") {
          errors.push(`console.error: ${message.text()}`);
        }
      });
      page.on("pageerror", error => {
        errors.push(`pageerror: ${error.message}`);
      });

      try {
        await waitForServer(url, serverProcess);
        await page.goto(url, { waitUntil: "domcontentloaded" });
        await expect(page.locator("canvas").first()).toBeVisible();
        await delay(renderSettleTimeMs);
        expect(errors, `${sampleName} emitted console or page errors`).toEqual([]);
      } finally {
        await stopProcess(serverProcess);
      }
    });
  }
});
