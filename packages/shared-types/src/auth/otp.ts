import z from "zod";

export const OtpSchema = z
  .object({
    otp: z
      .string()
      .regex(/^[0-9]{6}$/, { error: "OTP Code must contain only digits" })
      .length(6, { error: "OTP Code must be exactly 6 digits" }),
    email: z.email(),
  })
  .required();

export type OtpSchemaType = z.infer<typeof OtpSchema>;
