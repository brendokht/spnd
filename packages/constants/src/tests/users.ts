import { Providers } from "../auth";

export const exampleUser = {
  email: "user@example.com",
  identities: [{ provider: Providers.Google }, { provider: Providers.Email }],
};
export const newUser = { email: "new@example.com" };
export const takenUser = { email: "taken@example.com" };
export const notTakenUser = { email: "not-taken@example.com" };
export const oauthUser = { email: "oauth@example.com" };
