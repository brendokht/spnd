"use client";

import { useAuth } from "@/context/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@spnd/ui/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const { user } = useAuth();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  };

  return (
    <header className="flex items-center justify-between">
      <h1 className="text-xl font-bold">Spnd</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">{user?.email}</span>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Sign out"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
