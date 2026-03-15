import { test, expect } from "@playwright/test";

/**
 * Dashboard tests run against the unauthenticated redirect behavior,
 * and also test pages that render with mock/seed data when accessible.
 *
 * For full auth flows, set TEST_USER_EMAIL and TEST_USER_PASSWORD env vars.
 */

const email = process.env.TEST_USER_EMAIL ?? "";
const password = process.env.TEST_USER_PASSWORD ?? "";
const hasCredentials = email !== "" && password !== "";

async function loginAndGoto(page: any, path: string) {
  await page.goto("/login");
  await page.locator("input[type='email']").fill(email);
  await page.locator("input[type='password']").fill(password);
  await page.getByRole("button", { name: /initialize connection/i }).click();
  await page.waitForURL(/\/(overview|dashboard)/, { timeout: 15_000 });
  await page.goto(path);
}

test.describe("Dashboard — unauthenticated redirect", () => {
  const dashboardRoutes = [
    "/overview",
    "/costs",
    "/teams",
    "/alerts",
    "/connectors",
    "/optimize",
    "/settings",
  ];

  for (const route of dashboardRoutes) {
    test(`${route} redirects to login when unauthenticated`, async ({ page }) => {
      await page.goto(route);
      // withAuth middleware redirects to /api/auth/signin which then goes to /login
      // Give enough time for the dev-mode redirect chain to complete
      await expect(page).toHaveURL(/\/(login|api\/auth\/signin)/, { timeout: 20_000 });
    });
  }
});

test.describe("Dashboard — authenticated", () => {
  test.skip(!hasCredentials, "Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run authenticated tests");

  test("overview page renders metric cards and period toggle", async ({ page }) => {
    await loginAndGoto(page, "/overview");
    await expect(page.locator("text=30D")).toBeVisible();
    await expect(page.locator("text=LIVE")).toBeVisible();
  });

  test("period toggle changes active selection", async ({ page }) => {
    await loginAndGoto(page, "/overview");
    await page.locator("button", { hasText: "7D" }).click();
    await expect(page.locator("button", { hasText: "7D" })).toHaveClass(/text-\[#00F0FF\]/);
  });

  test("breadcrumb shows correct page name", async ({ page }) => {
    await loginAndGoto(page, "/overview");
    await expect(page.locator("text=Command Center")).toBeVisible();
  });

  test("sidebar navigation — Costs page", async ({ page }) => {
    await loginAndGoto(page, "/overview");
    await page.getByRole("link", { name: /cost intelligence/i }).click();
    await expect(page).toHaveURL(/\/costs/);
  });

  test("sidebar navigation — Teams page", async ({ page }) => {
    await loginAndGoto(page, "/overview");
    await page.getByRole("link", { name: /team/i }).click();
    await expect(page).toHaveURL(/\/teams/);
  });

  test("sidebar navigation — Alerts page", async ({ page }) => {
    await loginAndGoto(page, "/overview");
    await page.getByRole("link", { name: /alert/i }).click();
    await expect(page).toHaveURL(/\/alerts/);
  });

  test("sidebar navigation — Connectors page", async ({ page }) => {
    await loginAndGoto(page, "/overview");
    await page.getByRole("link", { name: /connector|neural link/i }).click();
    await expect(page).toHaveURL(/\/connectors/);
  });

  test("sidebar navigation — Optimize page", async ({ page }) => {
    await loginAndGoto(page, "/overview");
    await page.getByRole("link", { name: /optim/i }).click();
    await expect(page).toHaveURL(/\/optimize/);
  });

  test("settings page renders sidebar sections", async ({ page }) => {
    await loginAndGoto(page, "/settings");
    await expect(page.locator("text=System Configuration")).toBeVisible();
    for (const section of ["Profile", "Security", "Notifications", "Appearance"]) {
      await expect(page.locator("button", { hasText: section })).toBeVisible();
    }
  });

  test("settings section switching works", async ({ page }) => {
    await loginAndGoto(page, "/settings");

    await page.locator("button", { hasText: "Security" }).click();
    await expect(page.locator("text=Current Password")).toBeVisible();

    await page.locator("button", { hasText: "Notifications" }).click();
    await expect(page.locator("text=Alert Emails")).toBeVisible();

    await page.locator("button", { hasText: "Appearance" }).click();
    await expect(page.locator("text=Neural Dark")).toBeVisible();
  });

  test("notification toggles can be clicked", async ({ page }) => {
    await loginAndGoto(page, "/settings");
    await page.locator("button", { hasText: "Notifications" }).click();
    // Find the first toggle button (rounded-full pill)
    const toggle = page.locator("button.rounded-full").first();
    const before = await toggle.evaluate((el) => el.className);
    await toggle.click();
    const after = await toggle.evaluate((el) => el.className);
    expect(before).not.toEqual(after);
  });
});
