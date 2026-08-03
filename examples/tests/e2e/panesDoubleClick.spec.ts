import { spawn } from "node:child_process";
import { createServer } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";
import type { ChildProcess } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sandboxDir = path.join(__dirname, "../..", "src/samples/PanesDoubleClick/sandbox");

const localHost = "127.0.0.1";
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const canvasVisibilityTimeoutMs = 15_000;
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

const getVisiblePaneHeights = async (chart: Locator) =>
  chart.evaluate((element: Element) =>
    Array.from(element.querySelectorAll("tr"))
      .filter(
        row =>
          row instanceof HTMLTableRowElement &&
          row.children.length === 3 &&
          row.children[1] instanceof HTMLTableCellElement &&
          row.children[1].style.position === "relative" &&
          row.getBoundingClientRect().height > 0
      )
      .map(row => Math.round(row.getBoundingClientRect().height))
  );

const getVisiblePaneCenters = async (chart: Locator) =>
  chart.evaluate((element: Element) => {
    const chartRect = element.getBoundingClientRect();

    return Array.from(element.querySelectorAll("tr"))
      .filter(
        row =>
          row instanceof HTMLTableRowElement &&
          row.children.length === 3 &&
          row.children[1] instanceof HTMLTableCellElement &&
          row.children[1].style.position === "relative" &&
          row.getBoundingClientRect().height > 0
      )
      .map(row => {
        const paneCellRect = row.children[1].getBoundingClientRect();
        return {
          x: Math.round(paneCellRect.left - chartRect.left + paneCellRect.width / 2),
          y: Math.round(paneCellRect.top - chartRect.top + paneCellRect.height / 2),
        };
      });
  });

test("Panes double click focuses and restores every pane in the sandbox", async ({
  page,
}) => {
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

  try {
    await waitForServer(url, serverProcess);
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const chart = page.locator("#panes-double-click-sandbox-chart");
    await expect(chart).toBeVisible({
      timeout: canvasVisibilityTimeoutMs,
    });

    const defaultMessage = page.getByText("Double-click any pane to focus it.");
    const focusedMessage = page.getByText("Double-click again to restore all panes.");
    const initialPaneHeights = await getVisiblePaneHeights(chart);
    const initialPaneCenters = await getVisiblePaneCenters(chart);

    const box = await chart.boundingBox();
    expect(box).not.toBeNull();
    const { x: chartX, y: chartY } = box!;

    for (const paneCenter of initialPaneCenters) {
      await page.mouse.dblclick(chartX + paneCenter.x, chartY + paneCenter.y);
      await expect(focusedMessage).toBeVisible();
      await expect.poll(async () => getVisiblePaneHeights(chart)).toHaveLength(1);
      const [focusedPaneCenter] = await getVisiblePaneCenters(chart);

      await page.mouse.dblclick(
        chartX + focusedPaneCenter.x,
        chartY + focusedPaneCenter.y
      );
      await expect(defaultMessage).toBeVisible();
      await expect
        .poll(async () => getVisiblePaneHeights(chart))
        .toEqual(initialPaneHeights);
    }
  } finally {
    await stopProcess(serverProcess);
  }
});
