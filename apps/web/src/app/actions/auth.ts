"use server";

import { appUrl } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import { SignOut } from "@supabase/supabase-js";
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

// TODO: Ensure form is valid on server as well (use Zod `parse`)

export async function sendMagicLink(
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

export async function googleOAuthLogin(): Promise<AuthFormState> | never {
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

export async function signOut(opts: SignOut): Promise<AuthFormState> | never {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut(opts);

  if (error) {
    return {
      success: false,
      message: "",
      errors: [error.message],
    };
  }

  if (opts.scope === "others") {
    return {
      success: true,
      message: "All other sessions have been signed out",
      errors: [],
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function changeEmail(
  prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const supabase = await createClient();

  const email = formData.get("email")?.toString();

  const { error } = await supabase.auth.updateUser(
    { email: email },
    { emailRedirectTo: "http://localhost:3000/settings" },
  );

  if (error) {
    return {
      success: false,
      message: "",
      errors: [error.message],
    };
  }

  return {
    success: true,
    message: "Emails have been sent to the old and new email address",
    errors: [],
  };
}

export async function linkGoogleOAuth(): Promise<AuthFormState> | never {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.linkIdentity({
    provider: "google",
    options: {
      redirectTo: "http://localhost:3000/settings",
    },
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

export async function unlinkGoogleOAuth(): Promise<AuthFormState> | never {
  const supabase = await createClient();

  const { data: userIdentitiesData, error: userIdentitiesError } =
    await supabase.auth.getUserIdentities();

  if (userIdentitiesError) {
    return {
      success: false,
      message: "",
      errors: [userIdentitiesError.message],
    };
  }

  if (!userIdentitiesData) {
    return {
      success: false,
      message: "",
      errors: ["No identites to unlink"],
    };
  }

  const googleIdentity = userIdentitiesData.identities.find(
    (i) => i.provider === "google",
  );

  if (!googleIdentity) {
    return {
      success: false,
      message: "",
      errors: ["Google identity not found"],
    };
  }

  const { error: unlinkError } =
    await supabase.auth.unlinkIdentity(googleIdentity);

  if (unlinkError) {
    return {
      success: false,
      message: "",
      errors: [unlinkError.message],
    };
  }

  revalidatePath("/", "layout");

  return {
    success: true,
    message: "Google identity successfully unlinked",
    errors: [],
  };
}
