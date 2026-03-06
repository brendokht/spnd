import { test, expect } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } }); // unauthenticated

test.describe("Login page", () => {
  test("renders email input, send magic link button, Google button, and register link", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /send magic link/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /continue with google/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /register/i })).toBeVisible();
  });

  test("unauthenticated visit to / redirects to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("submitting email reveals OTP input section", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("otp-test@example.com");
    await page.getByRole("button", { name: /send magic link/i }).click();
    await expect(page.getByPlaceholder(/6-digit code/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /verify/i })).toBeVisible();
  });
});
