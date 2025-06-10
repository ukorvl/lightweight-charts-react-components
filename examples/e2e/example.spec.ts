import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("./");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle("Lightweight-charts React Components Examples");
});

test("canvas rendering", async ({ page }) => {
  await page.goto("./");

  // Return the number of example sections
  const exampleSection = await page.getByLabel("Examples of library usage");
  expect(exampleSection).toHaveCount(1);

  // Return the number of examples
  const examples = await exampleSection.locator(">div"); // Gets only the immediate div children of the locator
  expect(examples).toHaveCount(13);

  // Check if the canvas of each example rendered
  const canvases = await examples.locator("canvas");
  const canvasesCount = await canvases.count();
  for (let i = 0; i < canvasesCount; i++) expect(canvases.nth(i)).toBeVisible();
});

test("valid links", async ({ page }) => {
  await page.goto("./");

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
