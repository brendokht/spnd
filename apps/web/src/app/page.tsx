import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
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

  return (
    <p className="flex h-[calc(100vh-8.25rem)] items-center justify-center text-lg font-bold">
      Welcome back, {user.email}
    </p>
  );
}
