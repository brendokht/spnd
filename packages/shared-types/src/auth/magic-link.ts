import z from "zod";

export const MagicLinkSchema = z
  .object({
    email: z.email(),
  })
  .required();

export type MagicLinkSchemaType = z.infer<typeof MagicLinkSchema>;
