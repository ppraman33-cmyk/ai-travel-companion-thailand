import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function useReturningTraveler(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("atct-onboarding-completed", "synthetic-e2e-complete");
  });
}

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
  "/welcome",
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

test("first-run onboarding persists only after success and supports local-only skip", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (
      request.url().includes("/api/v1/") &&
      !["GET", "HEAD", "OPTIONS"].includes(request.method())
    )
      requests.push(request.url());
  });

  await page.goto("/");
  await expect(page.getByText("Step 1 of 5")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Explore Thailand with confidence." }),
  ).toBeHidden();
  await page.getByRole("button", { name: "Skip all" }).click();
  await expect(
    page.getByRole("heading", { name: "Explore Thailand with confidence." }),
  ).toBeVisible();
  expect(requests).toEqual([]);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Explore Thailand with confidence." }),
  ).toBeVisible();

  await page.evaluate(() => localStorage.removeItem("atct-onboarding-completed"));
  await page.route("**/api/v1/sessions", async (route) => {
    await route.fulfill({
      body: JSON.stringify({ data: { id: "synthetic-session" } }),
      headers: {
        "content-type": "application/json",
        "set-cookie": "atct_csrf=synthetic-csrf; Path=/; SameSite=Lax",
      },
      status: 201,
    });
  });
  let profileWrites = 0;
  await page.route("**/api/v1/profiles", async (route) => {
    if (route.request().method() === "POST") {
      profileWrites += 1;
      expect(route.request().headers()["x-csrf-token"]).toBe("synthetic-csrf");
      await route.fulfill({
        body: JSON.stringify({ data: { id: "synthetic-profile", active: true } }),
        contentType: "application/json",
        status: 201,
      });
      return;
    }
    await route.continue();
  });
  await page.reload();
  for (const choice of [
    "Public transit",
    "Budget",
    "Solo traveler",
    "Low — relaxed pace",
  ]) {
    await page.getByRole("button", { name: choice, exact: true }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();
  }
  await page.getByRole("textbox", { name: /Profile name/ }).fill("Solo Thailand");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(
    page.getByRole("heading", { name: "Explore Thailand with confidence." }),
  ).toBeVisible();
  expect(profileWrites).toBe(1);
});

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
      name: "Explore Thailand with confidence.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Help & assistance" })).toBeVisible();
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

test("Traveler UI Foundation Batch 1 renders all five production-shaped screens", async ({
  page,
}) => {
  await useReturningTraveler(page);
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/welcome");
  await expect(
    page.getByRole("heading", {
      name: "Thailand feels closer with a trusted companion.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Start exploring" })).toBeVisible();
  await expect(page.getByText("Approved mascot direction")).toBeVisible();

  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "SOS unavailable in demo" }),
  ).toBeDisabled();
  await expect(page.getByRole("button", { name: "Coming later" })).toBeDisabled();
  await expect(
    page.getByLabel("Start your journey").getByRole("link", { name: "Trips" }),
  ).toHaveAttribute("href", "/trips");
  await expect(page.getByRole("link", { name: "Saved places" })).toHaveAttribute(
    "href",
    "/saved",
  );
  await expect(page.getByRole("link", { name: "Travel profile" })).toHaveAttribute(
    "href",
    "/profile",
  );
  await expect(page.getByRole("link", { name: "Help & assistance" })).toHaveAttribute(
    "href",
    "/help",
  );
  await expect(page.getByRole("heading", { name: "Featured provinces" })).toBeVisible();
  await expect(page.getByText("Synthetic visual").first()).toBeVisible();
  for (const link of [
    page.getByRole("link", { name: "Open Help information" }),
    page.getByRole("link", { name: "See all →" }).first(),
  ]) {
    const box = await link.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }

  await page.route("**/api/v1/preferences", async (route) => {
    await route.fulfill({
      body: JSON.stringify({ data: { travelStyle: "food" } }),
      contentType: "application/json",
      status: 200,
    });
  });

  await page.goto("/explore");
  await expect(page.getByRole("search")).toBeVisible();
  await expect(page.getByLabel("Region", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Province", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Recommended based on your preferences" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Choose a demo region, then go deeper." }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Explore results" })).toBeVisible();
  await page.getByLabel("Search demo content").fill("River Leaf");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/q=River(?:\+|%20)Leaf/);
  await expect(page.getByText("1 results")).toBeVisible();

  await page.goto("/thailand/northern/demo-lanna-province");
  await expect(
    page.getByRole("heading", { name: "Demo Lanna Province", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Province highlights" }),
  ).toBeVisible();
  await expect(page.getByText("Future illustrated province map")).toBeVisible();
  const provinceViewAllBox = await page
    .getByRole("link", { name: "View all →" })
    .boundingBox();
  expect(provinceViewAllBox?.height).toBeGreaterThanOrEqual(44);

  await page.goto(
    "/thailand/northern/demo-lanna-province/restaurants/river-leaf-kitchen",
  );
  await expect(
    page.getByRole("heading", { name: "River Leaf Kitchen", level: 1 }),
  ).toBeVisible();
  await expect(page.getByText("Opening hours")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Nearby & related" })).toBeVisible();
  for (const link of [
    page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", {
      name: "Explore",
    }),
    page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", {
      name: "Restaurants",
    }),
  ]) {
    const box = await link.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});

for (const viewport of responsiveViewports) {
  test(`traveler routes have no document overflow at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await useReturningTraveler(page);
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
  });
}

test("Batch 2 profiles, Trips and itinerary render from owned synthetic contracts", async ({
  page,
}) => {
  await useReturningTraveler(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const data = path.endsWith("/profiles")
      ? [
          {
            id: "75000000-0000-4000-8000-000000000001",
            name: "Solo Thailand",
            transportation: "public_transit",
            travelStyle: "cultural",
            companions: "solo",
            activityLevel: "moderate",
            interests: [],
            active: true,
          },
        ]
      : path.endsWith("/trips")
        ? [
            {
              id: "71000000-0000-4000-8000-000000000001",
              title: "Synthetic northern loop",
              status: "draft",
              destination: "Demo Lanna Province",
              timezone: "Asia/Bangkok",
              travelerProfileId: "75000000-0000-4000-8000-000000000001",
            },
          ]
        : path.endsWith("/days")
          ? [
              {
                id: "72000000-0000-4000-8000-000000000001",
                tripId: "71000000-0000-4000-8000-000000000001",
                plannedDate: "2030-01-01",
                dayOrder: 0,
              },
            ]
          : path.endsWith("/items")
            ? [
                {
                  id: "73000000-0000-4000-8000-000000000001",
                  dayId: "72000000-0000-4000-8000-000000000001",
                  order: 0,
                  placeId: "00000000-0000-4000-8000-000000000101",
                  plannedAt: "09:30",
                  notes: "Synthetic stop",
                  aiGenerated: false,
                },
              ]
            : [];
    await route.fulfill({
      body: JSON.stringify({ data, error: null, meta: { requestId: "e2e" } }),
      contentType: "application/json",
      status: 200,
    });
  });

  await page.goto("/profile");
  await expect(page.getByText("Solo Thailand").first()).toBeVisible();
  await expect(page.getByText("Live AI disabled")).toBeVisible();

  await page.goto("/trips");
  await page.getByText("Synthetic northern loop").first().click();
  await expect(page.getByText("Lantern Garden")).toBeVisible();
  await expect(page.getByText("09:30")).toBeVisible();
  await expect(page.getByText(/Live AI is off/)).toBeVisible();
  for (const viewport of responsiveViewports) {
    await page.setViewportSize(viewport);
    const overflow = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: innerWidth,
      offenders: [...document.querySelectorAll<HTMLElement>("body *")]
        .filter((element) => element.getBoundingClientRect().right > innerWidth + 1)
        .map((element) => ({
          className: element.className,
          tag: element.tagName,
          text: element.textContent?.trim().slice(0, 80),
        }))
        .slice(0, 10),
    }));
    expect(
      overflow,
      `${viewport.width}x${viewport.height}: ${JSON.stringify(overflow.offenders)}`,
    ).toMatchObject({ documentWidth: overflow.viewportWidth });
  }
});

test("primary traveler pages have no serious or critical axe violations", async ({
  page,
}) => {
  await useReturningTraveler(page);
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
    page.getByRole("heading", { name: "Demo Lanna Province", exact: true }),
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
  await useReturningTraveler(page);
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
