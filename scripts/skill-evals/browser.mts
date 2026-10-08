#!/usr/bin/env node
// Browser checker extension contract and native observations. Checks return
// concrete expected/actual evidence; public APIs also set deterministic test ranges.
import { expect } from "@playwright/test";
import type { Assertion } from "./types.mts";
import type { Page } from "@playwright/test";
import type { IChartApi, ISeriesApi, SeriesType, Time } from "lightweight-charts";

declare global {
  interface Window {
    __skillEvalCharts: {
      chart: IChartApi;
      host: HTMLElement;
      series: ISeriesApi<SeriesType, Time>[];
      removed: boolean;
    }[];
  }
}
export type BrowserContext = { page: Page; results: Assertion[] };
export type ScenarioChecker = (context: BrowserContext) => Promise<void>;
export async function check(
  context: BrowserContext,
  id: string,
  work: () => Promise<unknown>
) {
  try {
    context.results.push({
      id,
      category: "scenario",
      critical: true,
      status: "PASS",
      evidence: await work(),
    });
  } catch (error) {
    context.results.push({
      id,
      category: "scenario",
      critical: true,
      status: "FAIL",
      evidence: { error: String(error) },
    });
  }
}
export async function settled(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      )
  );
}
export async function snapshot(page: Page) {
  await settled(page);
  return page.evaluate(() =>
    window.__skillEvalCharts
      .filter(entry => !entry.removed)
      .map(entry => ({
        range: entry.chart.timeScale().getVisibleLogicalRange(),
        panes: entry.chart.panes().length,
        width: entry.host.clientWidth,
        height: entry.host.clientHeight,
        series: entry.series.map(series => ({
          type: series.seriesType(),
          pane: series.getPane().paneIndex(),
          scaleId: series.options().priceScaleId,
          data: series.data(),
          margins: series.priceScale().options().scaleMargins,
        })),
      }))
  );
}
export async function setRange(page: Page, from: number, to: number) {
  await page.evaluate(
    ({ from: start, to: end }) => {
      const entry = window.__skillEvalCharts.find(chart => !chart.removed);
      if (!entry) throw new Error("No active chart");
      entry.chart.timeScale().setVisibleLogicalRange({ from: start, to: end });
    },
    { from, to }
  );
  await settled(page);
}
export async function ready(page: Page) {
  await page.waitForFunction(
    () =>
      window.__skillEvalCharts?.some(
        entry => !entry.removed && entry.series.some(series => series.data().length > 0)
      ),
    null,
    { timeout: 5000 }
  );
}
export async function candleData(page: Page) {
  const charts = await snapshot(page);
  const candle = charts
    .flatMap(chart => chart.series)
    .find(series => series.type === "Candlestick");
  if (!candle) throw new Error("No candle series");
  return candle.data;
}
export async function range(page: Page) {
  const current = (await snapshot(page))[0]?.range;
  if (!current) throw new Error("No visible logical range");
  return current;
}
export function expectRange(
  actual: { from: number; to: number },
  expected: { from: number; to: number }
) {
  expect(actual.from).toBeCloseTo(expected.from, 6);
  expect(actual.to).toBeCloseTo(expected.to, 6);
}
export async function hoverCandle(page: Page, index = -1) {
  const point = await page.evaluate(barIndex => {
    const entry = window.__skillEvalCharts.find(chart => !chart.removed);
    const series = entry?.series.find(value => value.seriesType() === "Candlestick");
    if (!entry || !series) throw new Error("No candle series");
    const bar = series.data().at(barIndex);
    if (!bar || !("close" in bar)) throw new Error("No last candle");
    const x = entry.chart.timeScale().timeToCoordinate(bar.time);
    const y = series.priceToCoordinate(bar.close);
    if (x === null || y === null) throw new Error("Candle outside viewport");
    const bounds = entry.host.getBoundingClientRect();
    return { x: bounds.left + x, y: bounds.top + y };
  }, index);
  await page.mouse.move(point.x, point.y);
  await settled(page);
}
