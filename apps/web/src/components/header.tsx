import { createClient } from "@/lib/supabase/server";
import { Skeleton } from "@spnd/ui/components/ui/skeleton";
import Link from "next/link";
import UserMenu from "./user-menu";

export function HeaderSkeleton() {
  return (
    <header className="flex items-center justify-between">
      <Link href="/" className="text-xl font-bold">
        Spnd
      </Link>
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="size-9 shrink-0 rounded-full" />
      </div>
    </header>
  );
}

export async function Header() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="flex items-center justify-between">
      <Link href="/" className="text-xl font-bold">
        Spnd
      </Link>
      <div className="flex items-center gap-3">
        {user?.email && <span className="text-sm">{user.email}</span>}
        <UserMenu user={user} />
      </div>
    </header>
  );
}
