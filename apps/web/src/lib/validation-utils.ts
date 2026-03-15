import { type AuthFormState } from "@/app/actions/auth";
import { z, type ZodObject } from "zod";

export function validateFormData<T>(
  formData: FormData,
  formSchema: ZodObject,
): AuthFormState | T {
  const { success, data, error } = formSchema.safeParse(
    Object.fromEntries(formData),
  );

  if (!success) {
    const validationErrors = z.treeifyError(error);
    return {
      success: false,
      message: "",
      errors: validationErrors.errors,
    };
  }

  if (!data) {
    return {
      success: false,
      message: "",
      errors: ["Something went wrong, please try again"],
    };
  }

  return data as T;
}
