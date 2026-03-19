import { expect, test } from "@playwright/test";
import {
  changeEmailSuccess,
  duplicateEmailError,
  notTakenUser,
  oauthUser,
} from "@spnd/constants/tests";
import { OAUTH_USER_STORAGE_STATE } from "../playwright.config";

// Uses authenticated storageState from playwright.config.ts (via "chromium" project)

test.describe("Settings Page", () => {
  test.describe("Account Tab", () => {
    test.describe("Initial Rendering", () => {
      test("renders settings tabs", async ({ page }) => {
        await page.goto("/settings");
        await expect(page.getByRole("tab", { name: /account/i })).toBeVisible();
        await expect(
          page.getByRole("tab", { name: /security/i }),
        ).toBeVisible();
      });

      test("renders account tab with email and sign-in cards", async ({
        page,
      }) => {
        await page.goto("/settings");
        await expect(
          page.getByText("Change Email", { exact: true }),
        ).toBeVisible();
        await expect(
          page.getByText("Sign-in Methods", { exact: true }),
        ).toBeVisible();
      });

      test("renders email input and submit button", async ({ page }) => {
        await page.goto("/settings");
        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(
          page.getByRole("button", { name: /submit/i }),
        ).toBeVisible();
      });
    });

    test.describe("Email Update", () => {
      test("renders success confirmation after email update submission", async ({
        page,
      }) => {
        await page.goto("/settings");
        await page.waitForLoadState("networkidle");

        await page.getByLabel(/email/i).fill(notTakenUser.email);
        await page.getByRole("button", { name: /submit/i }).click();
        await expect(page.getByText(changeEmailSuccess)).toBeVisible();
      });

      test("renders error message on duplicate email submission", async ({
        page,
      }) => {
        await page.goto("/settings");
        await page.waitForLoadState("networkidle");

        await page.getByLabel(/email/i).fill(oauthUser.email);
        await page.getByRole("button", { name: /submit/i }).click();
        await expect(page.getByText(duplicateEmailError)).toBeVisible();
      });
    });

    test.describe("Google OAuth Link", () => {
      test("renders link confirmation dialog on button click", async ({
        page,
      }) => {
        await page.goto("/settings");
        await page.getByTestId("google-link-btn").click();
        await expect(
          page.getByText(/would you like to link google?./i),
        ).toBeVisible();
        await expect(
          page.getByRole("button", { name: /continue/i }),
        ).toBeVisible();
        await expect(
          page.getByRole("button", { name: /cancel/i }),
        ).toBeVisible();
      });

      /* TODO:
       * Look into Next.js testProxy option for mocking Supabase OAuth
       * request in server action
       * I think testProxy would actually allow us to mock the requests occuring in
       * the server actions, since we cannot currently mock them with a proper response
       * Relavent links:
       * https://github.com/vercel/next.js/blob/canary/packages/next/src/experimental/testmode/playwright/README.md
       * https://dev.to/weamadel/configure-playwright-with-nextjs-mock-apis-for-testing-44oh
       */
      // test("initiates oauth flow on confirmation", async ({ page }) => {
      //   await page.goto("/settings");

      //   // Intercept the Server Action POST to /settings
      //   await page.route("**/settings", async (route) => {
      //     if (route.request().method() === "POST") {
      //       await route.fulfill({
      //         status: 303,
      //         headers: {
      //           location: "https://example.com/mock-oauth-url?provider=google",
      //         },
      //       });
      //     } else {
      //       await route.continue();
      //     }
      //   });

      //   // Open the link dialog and confirm
      //   await page.getByTestId("google-link-btn").click();
      //   await expect(
      //     page.getByText(/would you like to link google?./i),
      //   ).toBeVisible();

      //   // Listener registered — not awaited yet, just queued
      //   const responsePromise = page.waitForResponse(
      //     (res) =>
      //       res.url().includes("/settings") &&
      //       res.request().method() === "POST",
      //   );

      //   await page.getByRole("button", { name: /continue/i }).click();

      //   // Await the promise
      //   const response = await responsePromise;

      //   // Verify the mocked server action responded with the redirect
      //   expect(response.status()).toBe(303);
      //   expect(response.headers()["location"]).toContain("provider=google");
      // });
    });

    test.describe("Google OAuth Unlink", () => {
      test.use({ storageState: OAUTH_USER_STORAGE_STATE });

      test("renders unlink button and dialog when google is linked", async ({
        page,
      }) => {
        await page.goto("/settings");
        await page.waitForLoadState("networkidle");

        // "Unlink" should be visible instead of "Link"
        await expect(page.getByTestId("google-unlink-btn")).toBeVisible();
        await expect(
          page.getByRole("button", { name: /^link$/i }),
        ).not.toBeVisible();

        await page.getByTestId("google-unlink-btn").click();
        await expect(
          page.getByText(/would you like to unlink google?/i),
        ).toBeVisible();
        await expect(
          page.getByRole("button", { name: /continue/i }),
        ).toBeVisible();
        await expect(
          page.getByRole("button", { name: /cancel/i }),
        ).toBeVisible();
      });

      /* TODO:
       * Look into Next.js testProxy option for mocking Supabase OAuth
       * request in server action
       * I think testProxy would actually allow us to mock the requests occuring in
       * the server actions, since we cannot currently mock them with a proper response
       * Relavent links:
       * https://github.com/vercel/next.js/blob/canary/packages/next/src/experimental/testmode/playwright/README.md
       * https://dev.to/weamadel/configure-playwright-with-nextjs-mock-apis-for-testing-44oh
       */
      // test("calls identity delete endpoint on confirmation", async ({
      //   page,
      // }) => {
      //   await page.goto("/settings");
      //   await page.waitForLoadState("networkidle");

      //   await page.getByTestId("google-unlink-btn").click();
      //   await expect(
      //     page.getByText(/would you like to unlink google?/i),
      //   ).toBeVisible();

      //   // Intercept the Server Action POST to /settings
      //   await page.route("**/settings", async (route) => {
      //     if (route.request().method() === "POST") {
      //       await route.fulfill({
      //         status: 200,
      //         headers: {
      //           "X-Action-Redirect": "/settings;push",
      //           "X-Action-Revalidated": "1",
      //         },
      //       });
      //     } else {
      //       await route.continue();
      //     }
      //   });

      //   // Register listener before clicking so we don't miss the request.
      //   const responsePromise = page.waitForResponse(
      //     (res) =>
      //       res.url().includes("/settings") &&
      //       res.request().method() === "POST",
      //   );

      //   await page.getByRole("button", { name: /continue/i }).click();
      //   const response = await responsePromise;

      //   // Verify the mocked server action responded with the correct status code
      //   expect(response.status()).toBe(200);
      //   expect(response.headers()["location"]).toBe("/settings");
      // });
    });
  });

  test.describe("Security Tab", () => {
    test.describe("Initial Rendering", () => {
      test("renders security tab with sign-out buttons", async ({ page }) => {
        await page.goto("/settings");
        await page.getByRole("tab", { name: /security/i }).click();
        await expect(
          page.getByText("Account Security", { exact: true }),
        ).toBeVisible();
        await expect(
          page.getByRole("button", { name: /sign out of other sessions/i }),
        ).toBeVisible();
        await expect(
          page.getByRole("button", { name: /sign out of all sessions/i }),
        ).toBeVisible();
      });

      test("account security card renders 2 buttons", async ({ page }) => {
        await page.goto("/settings");
        await page.getByRole("tab", { name: /security/i }).click();
        await expect(
          page.getByRole("button", { name: /sign out of other sessions/i }),
        ).toBeVisible();
        await expect(
          page.getByRole("button", { name: /sign out of all sessions/i }),
        ).toBeVisible();
      });
    });

    // TODO: Ensure tests ran in parallel are ran with different users
    /*
     * Keep running into issue where when the log out is triggered, it causes other
     * tests to fail due to a missing auth state.
     */

    // test("sign out other sessions shows success message", async ({ page }) => {
    //   await page.goto("/settings");
    //   await page.getByRole("tab", { name: /security/i }).click();
    //   await page
    //     .getByRole("button", { name: /sign out of other sessions/i })
    //     .click();
    //   await expect(page.getByRole("alertdialog")).toBeVisible();
    //   await page.getByRole("button", { name: /continue/i }).click();
    //   await expect(
    //     page.getByText(/all other sessions have been signed out./i),
    //   ).toBeVisible();
    // });

    // test("sign out everywhere redirects to /login", async ({ page }) => {
    //   await page.goto("/settings");
    //   await page.getByRole("tab", { name: /security/i }).click();
    //   await page
    //     .getByRole("button", { name: /sign out of all sessions/i })
    //     .click();
    //   await expect(page.getByRole("alertdialog")).toBeVisible();
    //   await page.getByRole("button", { name: /continue/i }).click();
    //   await expect(page).toHaveURL(/\/login/);
    // });
  });
});
