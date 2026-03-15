import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders hero headline", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /stop guessing/i })).toBeVisible();
  });

  test("renders hero badge and sub-headline", async ({ page }) => {
    // Use first() to avoid strict-mode collision — badge appears in hero AND footer
    await expect(page.locator("text=AI Cost Intelligence Platform").first()).toBeVisible();
    await expect(page.locator("text=The only platform")).toBeVisible();
  });

  test("renders navbar with logo and CTAs", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();
    await expect(page.getByRole("link", { name: /launch console/i })).toBeVisible();
  });

  test("nav feature links are present", async ({ page }) => {
    // Scope to nav to avoid matching hero CTA buttons with same href
    const nav = page.locator("nav");
    await expect(nav.locator("a[href='#features']")).toBeVisible();
    await expect(nav.locator("a[href='#how-it-works']")).toBeVisible();
    await expect(nav.locator("a[href='#pricing']")).toBeVisible();
  });

  test("renders product mockup in browser frame", async ({ page }) => {
    await expect(page.locator("text=costlens.io/dashboard")).toBeVisible();
    await expect(page.locator("text=Command Center").first()).toBeVisible();
  });

  test("product mockup shows metric cards", async ({ page }) => {
    await expect(page.locator("text=TOTAL AI SPEND")).toBeVisible();
    await expect(page.locator("text=$47,280")).toBeVisible();
    await expect(page.locator("text=ROI INDEX")).toBeVisible();
  });

  test("renders stats section", async ({ page }) => {
    await page.locator("text=The Problem").scrollIntoViewIfNeeded();
    await expect(page.locator("text=AI spend growth YoY")).toBeVisible();
    await expect(page.locator("text=of AI spend is wasted")).toBeVisible();
    await expect(page.locator("text=avg ROI after CostLens")).toBeVisible();
  });

  test("renders How It Works section with 3 steps", async ({ page }) => {
    await page.locator("#how-it-works").scrollIntoViewIfNeeded();
    await expect(page.locator("text=Connect your providers")).toBeVisible();
    await expect(page.locator("text=Attribute spend to teams")).toBeVisible();
    await expect(page.locator("text=Optimize and save")).toBeVisible();
  });

  test("renders features section with 6 capability cards", async ({ page }) => {
    const features = page.locator("#features");
    await features.scrollIntoViewIfNeeded();
    await expect(features.locator("text=Real-Time Monitoring")).toBeVisible();
    await expect(features.getByRole("heading", { name: "Team Attribution" })).toBeVisible();
    await expect(features.locator("text=Shadow AI Discovery")).toBeVisible();
    await expect(features.locator("text=Smart Optimization")).toBeVisible();
    await expect(features.getByRole("heading", { name: "ROI Measurement" })).toBeVisible();
    await expect(features.locator("text=Budget Guardrails")).toBeVisible();
  });

  test("renders pricing section with 3 tiers", async ({ page }) => {
    await page.locator("#pricing").scrollIntoViewIfNeeded();
    const pricing = page.locator("#pricing");
    await expect(pricing.locator("text=Starter")).toBeVisible();
    await expect(pricing.getByText("Pro", { exact: true })).toBeVisible();
    await expect(pricing.locator("text=Enterprise")).toBeVisible();
    await expect(pricing.locator("text=$499")).toBeVisible();
    await expect(pricing.locator("text=Most Popular")).toBeVisible();
  });

  test("CTA email submit changes button text", async ({ page }) => {
    // Scroll to bottom and interact with the CTA email form
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    const emailInput = page.getByPlaceholder("Enter your work email");
    await emailInput.scrollIntoViewIfNeeded();
    await emailInput.fill("test@example.com");
    // Find the CTA submit button specifically (not nav buttons)
    // The button is the only <button> that has an onClick handler in the CTA section
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const ctaBtn = buttons.find(b => b.textContent?.includes("Get Early Access"));
      if (ctaBtn) ctaBtn.click();
    });
    // After click, button text should change
    await expect(page.locator("button").filter({ hasText: /you.re in/i })).toBeVisible({ timeout: 3000 });
  });

  test("Sign In link navigates to /login", async ({ page }) => {
    await page.getByRole("link", { name: "Sign In" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("Launch Console link navigates to /register", async ({ page }) => {
    await page.getByRole("link", { name: /launch console/i }).click();
    await expect(page).toHaveURL(/\/register/);
  });

  test("footer renders with operational status", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator("text=All systems operational")).toBeVisible();
  });
});
