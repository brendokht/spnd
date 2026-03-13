import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error(error.message);
    return "Unauthorized";
  }

  if (!user) {
    console.error("No user found");
    return "User not found";
  }

  return (
    <p className="flex h-[calc(100vh-8.25rem)] items-center justify-center text-lg font-bold">
      Welcome back, {user.email}
    </p>
  );
}
