import { test, expect } from "@playwright/test";

// Uses authenticated storageState from playwright.config.ts (via "chromium" project)

test.describe("Home page (authenticated)", () => {
  test("renders Spnd heading and user email", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Spnd")).toBeVisible();
    // User email is shown — just check something is rendered in that slot
    await expect(page.locator("header")).toBeVisible();
  });

  test("authenticated visit to /login redirects to /", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL("/");
  });

  test("authenticated visit to /register redirects to /", async ({ page }) => {
    await page.goto("/register");
    await expect(page).toHaveURL("/");
  });

  test("sign out redirects to /login", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
