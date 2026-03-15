import z from "zod";

export const ChangeEmailSchema = z
  .object({
    email: z.email(),
  })
  .required();

export type ChangeEmailSchemaType = z.infer<typeof ChangeEmailSchema>;
