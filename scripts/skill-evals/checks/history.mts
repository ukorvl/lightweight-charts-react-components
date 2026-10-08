#!/usr/bin/env node
// Draft history oracle. Public range setters create deterministic panning while
// the supplied UI resolves/rejects delayed transport requests and changes symbols.
import { expect } from "@playwright/test";
import { candleData, check, expectRange, range, ready, setRange } from "../browser.mts";
import type { BrowserContext } from "../browser.mts";
import type { Page } from "@playwright/test";

async function requests(page: Page): Promise<{ symbol: string; beforeMs: number }[]> {
  return JSON.parse(await page.getByLabel("Requests").innerText()) as {
    symbol: string;
    beforeMs: number;
  }[];
}
export async function verifyHistory(context: BrowserContext) {
  const { page } = context;
  await check(context, "history.response-time-view", async () => {
    await ready(page);
    await setRange(page, -2, 18);
    await expect.poll(async () => (await requests(page)).length).toBe(1);
    await setRange(page, -3, 17);
    expect(await requests(page)).toHaveLength(1);
    await setRange(page, 25, 45);
    const beforeData = await candleData(page);
    const before = await range(page);
    expect((await requests(page))[0]).toEqual({ symbol: "A", beforeMs: 1700000000000 });
    await page.getByRole("button", { name: "Resolve older", exact: true }).click();
    await expect.poll(async () => (await candleData(page)).length).toBe(90);
    await expect
      .poll(async () => (await range(page)).from)
      .toBeCloseTo(before.from + 10, 6);
    const after = await range(page);
    expectRange(after, { from: before.from + 10, to: before.to + 10 });
    const afterData = await candleData(page);
    expect(new Set(afterData.map(bar => bar.time)).size).toBe(90);
    expect(afterData.slice(10)).toEqual(beforeData);
    expect(afterData.slice(35, 56).map(bar => bar.time)).toEqual(
      beforeData.slice(25, 46).map(bar => bar.time)
    );
    return {
      before,
      after,
      newDistinctBars: 10,
      visibleTimesPreserved: true,
      requests: await requests(page),
    };
  });
  await check(context, "history.retry-and-exhaustion", async () => {
    await setRange(page, -2, 18);
    await expect.poll(async () => (await requests(page)).length).toBe(2);
    await page.getByRole("button", { name: "Fail request", exact: true }).click();
    await page.getByRole("button", { name: /^retry$/i }).click();
    await expect.poll(async () => (await requests(page)).length).toBe(3);
    await page.getByRole("button", { name: "Resolve empty", exact: true }).click();
    await setRange(page, -4, 16);
    await setRange(page, -5, 15);
    expect(await requests(page)).toHaveLength(3);
    return { requests: await requests(page) };
  });
  await check(context, "history.obsolete-symbol-response", async () => {
    await page.reload();
    await ready(page);
    await setRange(page, -2, 18);
    await expect.poll(async () => (await requests(page)).length).toBe(1);
    await page.getByRole("button", { name: "Switch symbol", exact: true }).click();
    const expectedTime = 1700000000 + 86400;
    await expect.poll(async () => (await candleData(page))[0]?.time).toBe(expectedTime);
    await setRange(page, 25, 45);
    const before = await candleData(page);
    const beforeRange = await range(page);
    await page.getByRole("button", { name: "Resolve older", exact: true }).click();
    expect(await candleData(page)).toEqual(before);
    expectRange(await range(page), beforeRange);
    return {
      symbol: await page.getByLabel("Symbol").innerText(),
      data: before,
      requests: await requests(page),
    };
  });
}
