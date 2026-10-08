#!/usr/bin/env node
// Draft overlay oracle: actual pane ownership, independent units/scale, geometry,
// and stable state through multiplying volume and repeated visibility changes.
import { expect } from "@playwright/test";
import { check, expectRange, range, ready, setRange, snapshot } from "../browser.mts";
import type { BrowserContext } from "../browser.mts";
import type { Page } from "@playwright/test";

async function priceCoordinates(page: Page) {
  return page.evaluate(() => {
    const entry = window.__skillEvalCharts.find(value => !value.removed);
    const series = entry?.series.find(value => value.seriesType() === "Candlestick");
    if (!entry || !series) throw new Error("Missing price");
    return { a: series.priceToCoordinate(100), b: series.priceToCoordinate(105) };
  });
}
export async function verifyVolume(context: BrowserContext) {
  const { page } = context;
  await check(context, "volume.panes-and-units", async () => {
    await ready(page);
    const charts = await snapshot(page);
    expect(charts).toHaveLength(1);
    const chart = charts[0];
    expect(chart.panes).toBe(2);
    expect(chart.series).toHaveLength(3);
    expect(chart.series.find(series => series.type === "Line")?.pane).toBe(0);
    const price = chart.series.find(series => series.type === "Candlestick");
    const volume = chart.series.find(series => series.type === "Histogram");
    expect(price?.pane).toBe(1);
    expect(volume?.pane).toBe(1);
    expect(volume?.scaleId).not.toBe(price?.scaleId);
    expect(volume?.data).toMatchObject(
      Array.from({ length: 80 }, (_, index) => ({
        time: 1700000000 + index * 60,
        value: 1000000 + index * 1000,
      }))
    );
    const geometry = await page.evaluate(() => {
      const entry = window.__skillEvalCharts.find(value => !value.removed);
      const series = entry?.series.find(value => value.seriesType() === "Histogram");
      if (!entry || !series) throw new Error("Missing volume series");
      const points = series.data().filter(bar => "value" in bar);
      const maximum = Math.max(...points.map(bar => ("value" in bar ? bar.value : 0)));
      const y = series.priceToCoordinate(maximum);
      return { y, height: series.getPane().getHeight() };
    });
    expect(geometry.y).not.toBeNull();
    expect(geometry.y! / geometry.height).toBeGreaterThanOrEqual(0.77);
    expect(geometry.y! / geometry.height).toBeLessThanOrEqual(0.84);
    return { chart, geometry };
  });
  await check(context, "volume.independent-scaling", async () => {
    await setRange(page, 20, 40);
    const before = await priceCoordinates(page);
    expect(before.a).not.toBeNull();
    expect(before.b).not.toBeNull();
    expect(Math.abs(before.a! - before.b!)).toBeGreaterThan(10);
    await page.getByRole("button", { name: "Multiply volume", exact: true }).click();
    await expect
      .poll(
        async () =>
          (await snapshot(page))[0].series.find(series => series.type === "Histogram")
            ?.data[0]
      )
      .toMatchObject({ value: 100000000 });
    const after = await priceCoordinates(page);
    expect(after.a).toBeCloseTo(before.a!, 1);
    expect(after.b).toBeCloseTo(before.b!, 1);
    return { before, after };
  });
  await check(context, "volume.toggle-preserves-context", async () => {
    const beforeRange = await range(page);
    const before = (await snapshot(page))[0].series.filter(
      series => series.type !== "Histogram"
    );
    for (let index = 0; index < 3; index++) {
      await page.getByRole("button", { name: "Toggle volume", exact: true }).click();
      const hidden = (await snapshot(page))[0];
      const volume = hidden.series.find(series => series.type === "Histogram");
      // A mounted invisible series and removal are both supported implementations.
      if (volume) {
        const visible = await page.evaluate(
          () =>
            window.__skillEvalCharts
              .find(entry => !entry.removed)
              ?.series.find(series => series.seriesType() === "Histogram")
              ?.options().visible
        );
        expect(visible).toBe(false);
      }
      expect(hidden.series.filter(series => series.type !== "Histogram")).toEqual(before);
      expectRange(await range(page), beforeRange);
      await page.getByRole("button", { name: "Toggle volume", exact: true }).click();
      expect(
        (await snapshot(page))[0].series.filter(series => series.type === "Histogram")
      ).toHaveLength(1);
      expectRange(await range(page), beforeRange);
    }
    return { beforeRange, after: await snapshot(page) };
  });
}
