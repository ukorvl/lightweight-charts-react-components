import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(import.meta.env.VITE_APP_DEFAULT_TITLE);
});

test("canvas rendering", async ({ page }) => {
  await page.goto("/");

  const exampleSection = page.getByLabel("Examples of library usage");
  expect(exampleSection).toHaveCount(1);

  const examples = exampleSection.locator(">div");
  expect(examples).toHaveCount(13);

  const canvases = examples.locator("canvas");
  const canvasesCount = await canvases.count();
  for (let i = 0; i < canvasesCount; i++) expect(canvases.nth(i)).toBeVisible();
});

test("valid links", async ({ page }) => {
  await page.goto("/");

  const hrefAttrs = await page
    .locator("a")
    .evaluateAll(links => links.map(link => link.getAttribute("href")));

  const externalURLs = hrefAttrs.reduce((urls, url) => {
    if (url && !url?.startsWith("#")) urls.add(url);
    return urls;
  }, new Set<string>());

  for (const externalURl of externalURLs) {
    try {
      const response = await page.request.get(externalURl);
      expect.soft(response.ok(), `${externalURl} didnt return Ok response`).toBeTruthy();
    } catch {
      expect.soft(null, `${externalURl} didnt return Ok response `);
    }
  }
});
