import { expect, test } from "@playwright/test";

test.describe("Docs", () => {
  test("renders docs index and supports a version-specific unavailable topic state", async ({
    page,
  }) => {
    await page.goto("/docs");

    await expect(page.getByRole("heading", { level: 1, name: "Docs" })).toBeVisible();
    await expect(page.getByLabel("Docs version")).toBeVisible();
    await expect(
      page
        .getByRole("link", { name: "Pane Primitives" })
        .filter({ has: page.locator("h2") })
    ).toBeVisible();

    await page.goto("/docs/v2.2/pane-primitives");

    await expect(
      page.getByRole("heading", { level: 1, name: "Pane Primitives" })
    ).toBeVisible();
    await expect(page.getByText("Not available in this version")).toBeVisible();
  });

  test("shows 404 for an unknown docs route", async ({ page }) => {
    await page.goto("/docs/not-a-real-topic");

    await expect(page.getByText("404")).toBeVisible();
  });
});
