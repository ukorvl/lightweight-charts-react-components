#!/usr/bin/env node
// Draft live-chart oracle: normalization, feed transitions, stationary hover,
// historical viewport, and subscriber lifetime. Runs against the immutable host.
import { expect } from "@playwright/test";
import {
  candleData,
  check,
  expectRange,
  hoverCandle,
  range,
  ready,
  setRange,
  snapshot,
} from "../browser.mts";
import type { BrowserContext } from "../browser.mts";

const epoch = 1700000000;
export async function verifyLive(context: BrowserContext) {
  const { page } = context;
  await check(context, "live.normalization", async () => {
    await ready(page);
    const charts = await snapshot(page);
    expect(charts).toHaveLength(1);
    expect(charts[0].height).toBeGreaterThan(100);
    const data = await candleData(page);
    expect(data).toHaveLength(80);
    expect(data.map(bar => bar.time)).toEqual(
      Array.from({ length: 80 }, (_, index) => epoch + index * 60)
    );
    expect(data).toMatchObject(
      Array.from({ length: 80 }, (_, index) => ({
        time: epoch + index * 60,
        open: 100 + index / 100,
        high: 110,
        low: 90,
        close: index === 79 ? 103 : 101 + index / 100,
      }))
    );
    return { expectedLength: 80, chart: charts[0] };
  });
  await check(context, "live.stationary-hover-revision", async () => {
    await hoverCandle(page, 30);
    await expect
      .poll(async () => JSON.parse(await page.getByLabel("OHLC").innerText()) as unknown)
      .toMatchObject({
        timeMs: epoch * 1000 + 30 * 60000,
        open: 100.3,
        high: 110,
        low: 90,
        close: 101.3,
      });
    await hoverCandle(page);
    await expect
      .poll(async () => JSON.parse(await page.getByLabel("OHLC").innerText()) as unknown)
      .toMatchObject({ close: 103 });
    // Deliver through the actual control without moving the pointer off the bar.
    await page
      .getByRole("button", { name: "Revise current", exact: true })
      .evaluate(button => (button as HTMLButtonElement).click());
    await expect
      .poll(async () => JSON.parse(await page.getByLabel("OHLC").innerText()) as unknown)
      .toMatchObject({
        timeMs: epoch * 1000 + 79 * 60000,
        open: 100.79,
        high: 110,
        low: 90,
        close: 105,
      });
    expect(await candleData(page)).toHaveLength(80);
    return {
      details: await page.getByLabel("OHLC").innerText(),
      candles: await candleData(page),
    };
  });
  await check(context, "live.append-stale-and-view", async () => {
    await setRange(page, 20, 40);
    const before = await range(page);
    await page.getByRole("button", { name: "Append candle", exact: true }).click();
    await expect.poll(async () => (await candleData(page)).length).toBe(81);
    await page.getByRole("button", { name: "Deliver stale", exact: true }).click();
    const data = await candleData(page);
    expect(data.at(-1)).toMatchObject({ time: epoch + 80 * 60, close: 107 });
    expect(data.at(-2)).toMatchObject({ close: 105 });
    expect(data[78]).toMatchObject({
      time: epoch + 78 * 60,
      open: 100.78,
      high: 110,
      low: 90,
      close: 101.78,
    });
    expectRange(await range(page), before);
    await page.mouse.move(950, 750);
    await expect
      .poll(async () => JSON.parse(await page.getByLabel("OHLC").innerText()) as unknown)
      .toMatchObject({ close: 107 });
    return {
      before,
      after: await range(page),
      data,
      details: await page.getByLabel("OHLC").innerText(),
    };
  });
  await check(context, "live.cleanup", async () => {
    await page.getByRole("button", { name: "Toggle chart", exact: true }).click();
    await page
      .getByRole("button", { name: "Inspect subscriptions", exact: true })
      .click();
    await expect(page.getByLabel("Subscriptions")).toHaveText("0");
    expect(await snapshot(page)).toHaveLength(0);
    await page.getByRole("button", { name: "Toggle chart", exact: true }).click();
    await ready(page);
    await page
      .getByRole("button", { name: "Inspect subscriptions", exact: true })
      .click();
    await expect(page.getByLabel("Subscriptions")).toHaveText("1");
    return {
      activeCharts: (await snapshot(page)).length,
      subscriptions: await page.getByLabel("Subscriptions").innerText(),
    };
  });
}
