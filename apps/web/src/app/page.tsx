import { checkUserSession } from "@/lib/validation-utils";

export default async function HomePage() {
  const user = await checkUserSession();

  return (
    <p className="flex h-[calc(100vh-8.25rem)] items-center justify-center text-lg font-bold">
      Welcome back, {user.email}
    </p>
  );
}
