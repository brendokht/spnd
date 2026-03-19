import "server-only";

import { type FormState } from "@spnd/shared-types/forms";
import { z, type ZodObject } from "zod";
import { createClient } from "./supabase/server";
import { redirect } from "next/navigation";
import { User } from "@supabase/supabase-js";

export function validateFormData<T>(
  formData: FormData,
  formSchema: ZodObject,
): { ok: true; data: T } | { ok: false; state: FormState } {
  const { success, data, error } = formSchema.safeParse(
    Object.fromEntries(formData),
  );

  if (!success) {
    const validationErrors = z.treeifyError(error);
    return {
      ok: false,
      state: handleFormErrors(validationErrors.errors),
    };
  }

  if (!data) {
    return {
      ok: false,
      state: handleFormErrors(["Something went wrong, please try again"]),
    };
  }

  return { ok: true, data: data as T };
}

export function handleFormErrors(errors: string[]): FormState {
  return {
    success: false,
    errors: errors,
  };
}

export function handleFormSuccess(message: string): FormState {
  return { success: true, message: message };
}

export async function checkUserSession(): Promise<User> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    redirect("/login");
  }

  if (!user) {
    const userNotFoundError = encodeURI(
      "An error has occurred. Please try to sign in again.",
    );
    redirect(`/login?error_description=${userNotFoundError}`);
  }

  return user;
}
