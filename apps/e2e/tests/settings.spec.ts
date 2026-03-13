import { expect, test } from "@playwright/test";

// Uses authenticated storageState from playwright.config.ts (via "chromium" project)

test.describe("Settings page (authenticated)", () => {
  test("renders two tabs", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("tab", { name: /account/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /security/i })).toBeVisible();
  });

  test("account tab renders two cards", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByText("Change Email", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Sign-in Methods", { exact: true }),
    ).toBeVisible();
  });

  test("change email card has input and button", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /submit/i })).toBeVisible();
  });

  test("change email shows confirmation after submitting a new email", async ({
    page,
  }) => {
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");
    await page.getByLabel(/email/i).fill("change@example.com");
    await page.getByRole("button", { name: /submit/i }).click();
    await expect(
      page.getByText(
        /emails have been sent to the old and new email address./i,
      ),
    ).toBeVisible();
  });

  test("change email shows error on duplicated email submission", async ({
    page,
  }) => {
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");
    await page.getByLabel(/email/i).fill("new@example.com");
    await page.getByRole("button", { name: /submit/i }).click();
    await expect(
      page.getByText(
        /a user with this email address has already been registered./i,
      ),
    ).toBeVisible();
  });

  test.describe("google oauth link (user does not have google linked)", () => {
    test("google oauth link shows alert dialog before submitting", async ({
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
      await expect(page.getByRole("button", { name: /cancel/i })).toBeVisible();
    });

    test("google oauth link initiates oauth flow when confirmed", async ({
      page,
    }) => {
      await page.goto("/settings");

      // Intercept the Supabase OAuth authorize redirect so the browser doesn't
      // actually navigate away to Google. We capture the request so we can
      // assert the correct provider was requested.
      await page.route(
        "**/auth/v1/user/identities/authorize**",
        async (route) => {
          // Fulfill with an empty 200 so the page stays in place
          await route.fulfill({ status: 200, body: "" });
        },
      );

      // Open the link dialog and confirm
      await page.getByTestId("google-link-btn").click();
      await expect(
        page.getByText(/would you like to link google?./i),
      ).toBeVisible();

      // Listener registered — not awaited yet, just queued
      const oauthRequestPromise = page.waitForRequest((req) =>
        req.url().includes("/auth/v1/user/identities/authorize"),
      );

      await page.getByRole("button", { name: /continue/i }).click();

      // Await the promise since it will be resolved at same time as page.route() now
      const ouathRequestResponse = await oauthRequestPromise;

      // Verify the request targeted the Google provider
      expect(ouathRequestResponse.url()).not.toBeNull();
      expect(
        new URL(ouathRequestResponse.url())!.searchParams.get("provider"),
      ).toBe("google");
    });
  });

  test.describe("google oauth unlink (user has google linked)", () => {
    // The test user authenticates via Magic Link (email OTP), so they won't
    // have a Google identity in their real session. We intercept GET /auth/v1/user
    // before navigating so the auth context sees a Google identity, causing
    // hasGoogle=true and rendering the "Unlink" button instead of "Link".
    const MOCK_GOOGLE_IDENTITY_ID = "mock-google-identity-id";

    const mockUserWithGoogle = {
      id: "test-user-id",
      aud: "authenticated",
      role: "authenticated",
      email: process.env.TEST_USER_EMAIL ?? "test@example.com",
      identities: [
        {
          identity_id: MOCK_GOOGLE_IDENTITY_ID,
          id: MOCK_GOOGLE_IDENTITY_ID,
          user_id: "test-user-id",
          provider: "google",
          created_at: "2024-01-01T00:00:00Z",
          last_sign_in_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ],
      app_metadata: { provider: "google", providers: ["email", "google"] },
      user_metadata: {},
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    test.beforeEach(async ({ page }) => {
      // Intercept getUser (and getUserIdentities, which calls the same endpoint)
      // to return a user that has Google linked. Must be set up before goto()
      // so the auth context picks it up on initial load.
      await page.route("**/auth/v1/user", async (route) => {
        if (route.request().method() === "GET") {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mockUserWithGoogle),
          });
        } else {
          await route.continue();
        }
      });
    });

    test("unlink button and dialog appear when google is linked", async ({
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
      await expect(page.getByRole("button", { name: /cancel/i })).toBeVisible();
    });

    test("confirming unlink calls the identity delete endpoint", async ({
      page,
    }) => {
      // Fulfill the DELETE request so the app doesn't error out
      await page.route(
        `**/auth/v1/user/identities/${MOCK_GOOGLE_IDENTITY_ID}`,
        async (route) => {
          await route.fulfill({ status: 200, body: JSON.stringify({}) });
        },
      );

      await page.goto("/settings");
      await page.waitForLoadState("networkidle");

      await page.getByTestId("google-unlink-btn").click();
      await expect(
        page.getByText(/would you like to unlink google?/i),
      ).toBeVisible();

      // Register listener before clicking so we don't miss the request.
      // waitForRequest returns the Request object directly — no need for a
      // separate captured variable, which would have a race against the
      // async route handler that assigns it.
      const unlinkRequestPromise = page.waitForRequest((req) =>
        req
          .url()
          .includes(`/auth/v1/user/identities/${MOCK_GOOGLE_IDENTITY_ID}`),
      );

      await page.getByRole("button", { name: /continue/i }).click();
      const unlinkRequest = await unlinkRequestPromise;

      // Verify the correct identity was targeted with the right method
      expect(unlinkRequest.url()).toContain(MOCK_GOOGLE_IDENTITY_ID);
      expect(unlinkRequest.method()).toBe("DELETE");
    });
  });

  test("security tab renders one card", async ({ page }) => {
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
