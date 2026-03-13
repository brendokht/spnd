import { expect, test } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } }); // unauthenticated

test.describe("Register page", () => {
  test("renders correctly with email button and sign in link", async ({
    page,
  }) => {
    await page.goto("/register");
    await expect(page.getByText("Create an account")).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /continue with email/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /continue with google/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
  });

  test("submitting email reveals OTP input section", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel(/email/i).fill("register@example.com");
    await page.getByRole("button", { name: /continue with email/i }).click();
    await expect(page.getByPlaceholder(/6-digit code/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /verify/i })).toBeVisible();
  });
});
