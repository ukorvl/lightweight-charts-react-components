import { readdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { test, expect } from "@playwright/test";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const samplesDir = path.join(__dirname, "../..", "src/samples");
const examplesCount = readdirSync(samplesDir, { withFileTypes: true }).filter(dirent =>
  dirent.isDirectory()
).length;

const skipExternalLinksTest = process.env.DISABLE_EXTERNAL_LINK_TEST === "true";

test.describe("Main page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has title", async ({ page }) => {
    await expect(page).toHaveTitle(
      process.env.VITE_APP_DEFAULT_TITLE || "Wrong title, you should read from env"
    );
  });

  test("has important metatags", async ({ page }) => {
    const metas = ["description", "keywords", "author"];

    for (const meta of metas) {
      const metaTag = page.locator(`meta[name="${meta}"]`);
      await expect(metaTag).toHaveCount(1);
      await expect(metaTag).toHaveAttribute("name", meta);
      await expect(metaTag).toHaveAttribute("content", expect.any(String));
    }
  });

  test("canvas rendering", async ({ page }) => {
    const exampleSection = page.getByLabel("Examples of library usage");
    await expect(exampleSection).toHaveCount(1);

    const examples = exampleSection.locator(">div");
    await expect(examples).toHaveCount(examplesCount);

    const canvases = examples.locator("canvas");
    const canvasesCount = await canvases.count();
    for (let i = 0; i < canvasesCount; i++) await expect(canvases.nth(i)).toBeVisible();
  });

  test("valid links", async ({ page }) => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(skipExternalLinksTest, "Skipping external links test as per configuration");

    const hrefAttrs = await page
      .locator("a")
      .evaluateAll(links => links.map(link => link.getAttribute("href")));

    const externalURLs = hrefAttrs.filter(
      (url): url is string => url !== null && !url.startsWith("#") && !url.startsWith("/")
    );

    for (const externalURl of externalURLs) {
      try {
        const response = await page.request.get(externalURl);
        expect
          .soft(response.ok(), `${externalURl} didn't return Ok response`)
          .toBeTruthy();
      } catch {
        // eslint-disable-next-line playwright/no-conditional-expect
        expect
          .soft(false, `Failed to fetch ${externalURl}, check if the link is valid`)
          .toBeFalsy();
      }
    }
  });
});
