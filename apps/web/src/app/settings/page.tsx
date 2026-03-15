import { createClient } from "@/lib/supabase/server";
import Settings from "./settings";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return "Unauthorized";
  }

  if (!user) {
    return "User not found";
  }

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
