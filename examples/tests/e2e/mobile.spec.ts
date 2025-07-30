import { test, expect, devices } from "@playwright/test";

test.use({ ...devices["Pixel 5"] });

test.describe("Mobile-only tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("mobile menu works", async ({ page }) => {
    const menuButton = page.getByRole("button", { name: "toggle menu" });
    await expect(menuButton).toBeVisible();

    await menuButton.click();
    const drawer = page.getByTestId("mobile-menu");
    await expect(drawer).toBeVisible();

    const closeButton = drawer.getByRole("button", { name: "Close menu" });
    await expect(closeButton).toBeVisible();

    await closeButton.click();
    await expect(drawer).toBeHidden();
  });
});
