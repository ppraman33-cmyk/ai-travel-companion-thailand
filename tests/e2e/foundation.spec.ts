import { expect, test } from "@playwright/test";

test("renders the foundation shell", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/AI Travel Companion Thailand/);
  await expect(
    page.getByRole("heading", { name: "Implementation foundation" }),
  ).toBeVisible();
});
