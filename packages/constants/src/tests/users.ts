import { Providers } from "../auth";

export const exampleUser = {
  user: {
    email: "user@example.com",
    identities: [{ provider: Providers.Google }, { provider: Providers.Email }],
  },
};
export const newUser = { user: { email: "new@example.com" } };
export const takenUser = { user: { email: "taken@example.com" } };
export const oauthUser = { user: { email: "oauth@example.com" } };
