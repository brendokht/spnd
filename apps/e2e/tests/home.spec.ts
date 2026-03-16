import { expect, test } from "@playwright/test";

// Uses authenticated storageState from playwright.config.ts (via "chromium" project)
const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? "test@example.com";

test.describe("Home Page", () => {
  test.describe("Initial Rendering", () => {
    test("renders page heading and header", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByText("Spnd")).toBeVisible();
      await expect(page.locator("header")).toBeVisible();
    });
  });

  test.describe("Navigation", () => {
    test("navigates to settings page via user menu", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await page
        .getByRole("button", {
          name: TEST_EMAIL.charAt(0).toUpperCase(),
        })
        .first()
        .click();
      await page.waitForSelector("role=presentation");
      await page.getByRole("menuitem", { name: /settings/i }).click();
      await expect(page).toHaveURL(/\/settings/);
    });
  });

  test.describe("Authenticated Redirection", () => {
    test("redirects authenticated user from login page to home", async ({
      page,
    }) => {
      await page.goto("/login");
      await expect(page).toHaveURL("/");
    });

    test("redirects authenticated user from register page to home", async ({
      page,
    }) => {
      await page.goto("/register");
      await expect(page).toHaveURL("/");
    });
  });

  // TODO: Ensure tests ran in parallel are ran with different users
  /*
   * Keep running into issue where when the log out is triggered, it causes other
   * tests to fail due to a missing auth state.
   */
  // test("sign out redirects to /login", async ({ page }) => {
  //   await page.goto("/");
  //   await page.waitForLoadState("networkidle");
  //   await page
  //     .getByRole("button", {
  //       name: TEST_EMAIL.charAt(0).toUpperCase(),
  //     })
  //     .first()
  //     .click();
  //   await page.waitForSelector("role=presentation");
  //   await page.getByRole("menuitem", { name: /log out/i }).click();
  //   await expect(page).toHaveURL(/\/login/);
  // });
});
