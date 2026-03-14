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

  return <Settings user={user}></Settings>;
}
