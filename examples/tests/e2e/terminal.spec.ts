import { test, expect } from "@playwright/test";

test.describe("Terminal page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/terminal");
  });

  test("renders the terminal workspace card", async ({ page }) => {
    await expect(page).toHaveTitle(/Terminal$/);
    await expect(page.getByLabel("Terminal instruments panel")).toBeVisible();
    await expect(page.getByLabel("Asset info and chart controls")).toBeVisible();
    await expect(page.getByLabel("Terminal chart area")).toBeVisible();
  });
});
