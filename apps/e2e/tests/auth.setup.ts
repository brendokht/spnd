import { test as setup } from "@playwright/test";
import { STORAGE_STATE } from "../playwright.config";

const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? "test@example.com";
const MAILPIT_URL = "http://localhost:54324";

setup("authenticate", async ({ page, request }) => {
  // 1. Trigger OTP via UI (this is the OTP we need to intercept)
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(TEST_EMAIL);
  await page.getByRole("button", { name: /send magic link/i }).click();

  // 2. Wait for OTP input to appear, then fetch the email Mailpit received
  await page.getByPlaceholder(/6-digit code/i).waitFor({ state: "visible" });
  await page.waitForTimeout(1000);

  const mailResponse = await request.get(`${MAILPIT_URL}/api/v1/messages`);
  const mailData = await mailResponse.json();
  const latest = mailData.messages
    .filter((m: { To: { Address: string }[] }) =>
      m.To.some((t) => t.Address === TEST_EMAIL),
    )
    .sort(
      (a: { Created: string }, b: { Created: string }) =>
        new Date(b.Created).getTime() - new Date(a.Created).getTime(),
    )[0];

  const otp = latest?.Snippet?.match(/\d{6}/)?.[0];
  if (!otp) throw new Error("Could not extract OTP from email");

  // 3. Fill OTP and verify
  await page.getByPlaceholder(/6-digit code/i).fill(otp);
  await page.getByRole("button", { name: /verify/i }).click();
  await page.waitForURL("/");

  // 4. Save authenticated session to disk for reuse
  await page.context().storageState({ path: STORAGE_STATE });
});
