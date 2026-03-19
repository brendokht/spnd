"use server";

import { appUrl } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import {
  handleFormErrors,
  handleFormSuccess,
  validateFormData,
} from "@/lib/validation-utils";
import {
  ChangeEmailSchema,
  ChangeEmailSchemaType,
  MagicLinkSchema,
  type MagicLinkSchemaType,
  OtpSchema,
  type OtpSchemaType,
} from "@spnd/shared-types/auth";
import { FormState } from "@spnd/shared-types/forms";
import { SignOut } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Providers } from "@spnd/constants/auth";

/*
 * Fake delay
 * await new Promise((resolve) => setTimeout(resolve, 750));
 */

export async function sendMagicLink(
  prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const validationResult = validateFormData<MagicLinkSchemaType>(
    formData,
    MagicLinkSchema,
  );

  if (!validationResult.ok) {
    return validationResult.state;
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email: validationResult.data.email,
    options: { emailRedirectTo: `${appUrl}/auth/callback` },
  });

  if (error) {
    return handleFormErrors([error.message]);
  }

  return handleFormSuccess("Check your email for the magic link.");
}

export async function verifyOtp(
  prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> | never {
  const validationResult = validateFormData<OtpSchemaType>(formData, OtpSchema);

  if (!validationResult.ok) {
    return validationResult.state;
  }
  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    email: validationResult.data.email,
    token: validationResult.data.otp,
    type: Providers.Email,
  });

  if (error) {
    return handleFormErrors([error.message]);
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function googleOAuthLogin(): Promise<FormState> | never {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: Providers.Google,
    options: { redirectTo: `${appUrl}/auth/callback` },
  });

  if (error) {
    return handleFormErrors([error.message]);
  }

  redirect(data.url);
}

export async function signOut(opts: SignOut): Promise<FormState> | never {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut(opts);

  if (error) {
    return handleFormErrors([error.message]);
  }

  if (opts.scope === "others") {
    return handleFormSuccess("All other sessions have been signed out");
  }

  revalidatePath("/", "layout");
  redirect("/login");
}

export async function changeEmail(
  prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const validationResult = validateFormData<ChangeEmailSchemaType>(
    formData,
    ChangeEmailSchema,
  );

  if (!validationResult.ok) {
    return validationResult.state;
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser(
    { email: validationResult.data.email },
    { emailRedirectTo: `${appUrl}/settings` },
  );

  if (error) {
    return handleFormErrors([error.message]);
  }

  return handleFormSuccess(
    "Emails have been sent to the old and new email address",
  );
}

export async function linkGoogleOAuth(): Promise<FormState> | never {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.linkIdentity({
    provider: Providers.Google,
    options: {
      redirectTo: `${appUrl}/settings`,
    },
  });

  if (error) {
    return handleFormErrors([error.message]);
  }

  redirect(data.url);
}

export async function unlinkGoogleOAuth(): Promise<FormState> | never {
  const supabase = await createClient();

  const { data: userIdentitiesData, error: userIdentitiesError } =
    await supabase.auth.getUserIdentities();

  if (userIdentitiesError) {
    return handleFormErrors([userIdentitiesError.message]);
  }

  if (!userIdentitiesData) {
    return handleFormErrors(["No identites to unlink"]);
  }

  const googleIdentity = userIdentitiesData.identities.find(
    (i) => i.provider === Providers.Google,
  );

  if (!googleIdentity) {
    return handleFormErrors(["Google identity not found"]);
  }

  const { error: unlinkError } =
    await supabase.auth.unlinkIdentity(googleIdentity);

  if (unlinkError) {
    return handleFormErrors([unlinkError.message]);
  }

  revalidatePath("/", "layout");

  return handleFormSuccess("Google identity successfully unlinked");
}
