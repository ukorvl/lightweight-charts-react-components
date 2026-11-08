import { expect, test } from "@playwright/test";

test.describe("Panes sample", () => {
  test("applies overlay price scale options in a non-first pane", async ({ page }) => {
    await page.goto("/");

    const sample = page
      .getByLabel("Examples of library usage")
      .locator(">div")
      .filter({ hasText: "Multiple panes on the same chart" });
    await expect(sample).toHaveCount(1);

    await sample.getByRole("button", { name: "Show pane" }).click();

    // PriceScale errors are caught by the sample error boundary and replace the chart
    await expect(sample.getByRole("button", { name: "Hide pane" })).toBeVisible();
    await expect(
      sample.getByText("An error occurred while rendering this example")
    ).toHaveCount(0);
    await expect(sample.locator("canvas").first()).toBeVisible();
  });
});
