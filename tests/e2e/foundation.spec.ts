import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const responsiveViewports = [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
] as const;

const travelerRoutes = [
  "/",
  "/explore",
  "/thailand/northern/demo-lanna-province",
  "/thailand/northern/demo-lanna-province/restaurants",
  "/thailand/northern/demo-lanna-province/restaurants/river-leaf-kitchen",
  "/saved",
  "/trips",
  "/assistant",
  "/profile",
  "/help",
] as const;

test("renders the traveler PWA shell and primary navigation", async ({ page }) => {
  const hydrationErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && message.text().includes("Hydration failed"))
      hydrationErrors.push(message.text());
  });
  await page.setViewportSize({ width: 390, height: 844 });
  const documentResponse = await page.goto("/");
  const csp = documentResponse?.headers()["content-security-policy"] ?? "";
  expect(csp).toContain("'strict-dynamic'");
  expect(csp).toMatch(/'nonce-[A-Za-z0-9+/=]+'/);

  await expect(page).toHaveTitle(/AI Travel Companion Thailand/);
  const skipAll = page.getByRole("button", { name: "Skip all" });
  if (await skipAll.isVisible()) {
    await skipAll.click();
    await page.reload();
  }
  await expect(
    page.getByRole("heading", {
      name: "Thailand, thoughtfully explored",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Help & emergency/ }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link"),
  ).toHaveCount(5);
  await page.getByRole("button", { name: "TH" }).click();
  await expect(page.getByRole("link", { name: "สำรวจ" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "th");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "th");
  expect(hydrationErrors).toEqual([]);
  const thaiButtonBox = await page.getByRole("button", { name: "TH" }).boundingBox();
  expect(thaiButtonBox?.width).toBeGreaterThanOrEqual(44);
  expect(thaiButtonBox?.height).toBeGreaterThanOrEqual(44);
});

test("traveler routes have no document overflow at approved viewports", async ({
  page,
}) => {
  for (const viewport of responsiveViewports) {
    await page.setViewportSize(viewport);
    for (const route of travelerRoutes) {
      await page.goto(route);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(
        overflow,
        `${route} overflowed at ${viewport.width}x${viewport.height}`,
      ).toBe(false);
    }
  }
});

test("primary traveler pages have no serious or critical axe violations", async ({
  page,
}) => {
  for (const route of [
    "/",
    "/explore",
    "/thailand/northern/demo-lanna-province/restaurants/river-leaf-kitchen",
    "/help",
  ]) {
    await page.goto(route);
    const result = await new AxeBuilder({ page }).analyze();
    expect(
      result.violations.filter(
        (violation) =>
          violation.impact === "serious" || violation.impact === "critical",
      ),
      `serious/critical accessibility violations on ${route}`,
    ).toEqual([]);
  }
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
  await expect(page.getByRole("heading", { name: "Help & emergency" })).toBeVisible();

  await page.goto("/assistant");
  await expect(
    page.getByRole("heading", { name: "AI assistant is not active" }),
  ).toBeVisible();

  await page.goto("/provinces/00000000-0000-4000-8000-000000000001");
  await expect(
    page.getByRole("heading", { name: "Province profile unavailable" }),
  ).toBeVisible();
});

test("M2 canonical province journey remains synthetic and responsive", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/explore");
  await expect(page.getByTestId("synthetic-banner")).toBeVisible();
  await page.getByRole("link", { name: "Province guide" }).click();
  await expect(
    page.getByRole("heading", { name: "Demo Lanna Province" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Restaurants" }).click();
  await page.getByRole("link", { name: "River Leaf Kitchen" }).click();
  await expect(page.getByRole("heading", { name: "River Leaf Kitchen" })).toBeVisible();
  await expect(page.getByText("Synthetic M2 fixture")).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  const mapButton = page.getByRole("button", { name: "External maps" });
  await mapButton.click();
  await expect(
    page.getByRole("dialog", { name: "Leave Thailand Companion?" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(mapButton).toBeFocused();
});

test("desktop shell, keyboard focus and reduced-motion preference are supported", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await expect(
    page.getByRole("navigation", { name: "Primary navigation" }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeHidden();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  const animationDuration = await page
    .locator("html")
    .evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
  expect(animationDuration).toBe("auto");
});

test("emergency experience suppresses actions and is excluded from offline shell", async ({
  page,
}) => {
  await page.goto("/help");
  await expect(
    page.getByText("DEMO EMERGENCY DIRECTORY — DO NOT USE FOR REAL ASSISTANCE"),
  ).toBeVisible();
  await expect(page.getByText("Phone handoff")).toBeVisible();
  await expect(page.getByText("Disabled pending verification").first()).toBeVisible();
  const serviceWorker = await page.request.get("/sw.js");
  const source = await serviceWorker.text();
  expect(source).not.toMatch(/SHELL_PATHS[^;]*help/);
  expect(source).toContain('requestUrl.pathname.startsWith("/help")');
});
