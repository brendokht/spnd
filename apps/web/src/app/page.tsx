"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@spnd/ui/components/ui/button";
import { useAuth } from "@/context/auth";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  };

  return (
    <div className="space-y-6 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Spnd</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user?.email}</span>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main>
        <p className="text-gray-400">Yeahhhhhh boiiiiii</p>
      </main>
    </div>
  );
}
