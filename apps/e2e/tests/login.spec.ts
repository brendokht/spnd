import { expect, test } from "@playwright/test";
import { exampleUser } from "@spnd/constants/tests";

test.use({ storageState: { cookies: [], origins: [] } }); // unauthenticated

test.describe("Login Page", () => {
  test.describe("Initial Rendering", () => {
    test("renders login form and external links", async ({ page }) => {
      await page.goto("/login");
      await expect(page.getByText("Sign in")).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(
        page.getByRole("button", { name: /send magic link/i }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /continue with google/i }),
      ).toBeVisible();
      await expect(page.getByRole("link", { name: /register/i })).toBeVisible();
    });
  });

  test.describe("Form Interaction", () => {
    test("reveals OTP input section after submitting email", async ({
      page,
    }) => {
      await page.goto("/login");
      await page.getByLabel(/email/i).fill(exampleUser.email);
      await page.getByRole("button", { name: /send magic link/i }).click();
      await expect(page.getByTestId("otp-input")).toBeVisible();
      await expect(page.getByRole("button", { name: /verify/i })).toBeVisible();
    });
  });

  test.describe("Unauthenticated Redirection", () => {
    test("redirects unauthenticated user from home page to login", async ({
      page,
    }) => {
      await page.goto("/");
      await expect(page).toHaveURL(/\/login/);
    });
  });
});
