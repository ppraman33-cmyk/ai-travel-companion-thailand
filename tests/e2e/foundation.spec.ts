import { expect, test } from "@playwright/test";

test("renders the traveler PWA shell and primary navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page).toHaveTitle(/AI Travel Companion Thailand/);
  await expect(
    page.getByRole("heading", {
      name: "Thailand, thoughtfully explored",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Emergency and traveler help/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link"),
  ).toHaveCount(5);
});

test("fails closed for Admin and unavailable catalog configuration", async ({
  page,
}) => {
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Admin authentication required" }),
  ).toBeVisible();

  const response = await page.request.get("/api/v1/places");
  expect(response.status()).toBe(503);
  const body = (await response.json()) as { error: { code: string } };
  expect(body.error.code).toBe("UNAVAILABLE");
});

test("manifest and critical traveler pages remain accessible", async ({ page }) => {
  const manifest = await page.request.get("/manifest.webmanifest");
  expect(manifest.ok()).toBe(true);

  await page.goto("/trips");
  await expect(page.getByLabel("Trip name")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create trip" })).toBeVisible();

  await page.goto("/help");
  await expect(
    page.getByRole("heading", { name: "Emergency and traveler help" }),
  ).toBeVisible();

  await page.goto("/assistant");
  await expect(page.getByRole("heading", { name: "AI travel help" })).toBeVisible();

  await page.goto("/provinces/00000000-0000-4000-8000-000000000001");
  await expect(
    page.getByRole("heading", { name: "Province profile unavailable" }),
  ).toBeVisible();
});
