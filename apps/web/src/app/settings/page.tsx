import Settings from "./settings";
import { checkUserSession } from "@/lib/validation-utils";

export default async function SettingsPage() {
  const user = await checkUserSession();

  const userIdentities =
    user.identities?.map((identity) => identity.provider) ?? [];

  const hasGoogleIdentity = userIdentities.includes("google") ?? false;

  return (
    <Settings
      email={user.email ?? ""}
      hasGoogleIdentity={hasGoogleIdentity}
    ></Settings>
  );
}
