import { expect, test } from "@playwright/test";
import { exampleUser, newUser } from "@spnd/constants/tests";

test.use({ storageState: { cookies: [], origins: [] } }); // unauthenticated

test.describe("Register Page", () => {
  test.describe("Initial Rendering", () => {
    test("renders registration form and sign in link", async ({ page }) => {
      await page.goto("/register");
      await expect(page.getByText("Create an account")).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(
        page.getByRole("button", { name: /send magic link/i }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /continue with google/i }),
      ).toBeVisible();
      await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
    });
  });

  test.describe("Form Interaction", () => {
    test("reveals OTP input section after submitting email", async ({
      page,
    }) => {
      await page.goto("/register");
      await page.getByLabel(/email/i).fill(newUser.user.email);
      await page.getByRole("button", { name: /send magic link/i }).click();
      await expect(page.getByTestId("otp-input")).toBeVisible();
      await expect(page.getByRole("button", { name: /verify/i })).toBeVisible();
    });
  });
});
