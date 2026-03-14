"use server";

import { appUrl } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/*
 * Fake delay
 * await new Promise((resolve) => setTimeout(resolve, 750));
 */
export type AuthFormState = {
  success: boolean;
  message: string;
  errors: Array<string>;
};

export async function magicLinkLogin(
  prev: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const supabase = await createClient();

  const email = formData.get("email")?.toString();

  const { error } = await supabase.auth.signInWithOtp({
    email: email!,
    options: { emailRedirectTo: `${appUrl}/auth/callback` },
  });

  if (error) {
    return {
      success: false,
      message: "",
      errors: [error.message],
    };
  }

  return {
    success: true,
    message: "Check your email for the magic link.",
    errors: [],
  };
}

export async function verifyOtp(
  prev: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> | never {
  const supabase = await createClient();

  const email = formData.get("email")?.toString();
  const otp = formData.get("otp")?.toString();

  const { error } = await supabase.auth.verifyOtp({
    email: email!,
    token: otp!,
    type: "email",
  });

  if (error) {
    console.error(error.message);
    return {
      success: false,
      message: "",
      errors: [error.message],
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function googleOAuthLogin() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${appUrl}/auth/callback` },
  });

  if (error) {
    return {
      success: false,
      message: "",
      errors: [error.message],
    };
  }

  redirect(data.url);
}
