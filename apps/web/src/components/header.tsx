"use client";

import { useAuth } from "@/context/auth";
import { supabase } from "@/lib/supabase";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@spnd/ui/components/ui/avatar";
import { Button } from "@spnd/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@spnd/ui/components/ui/dropdown-menu";
import { Cog, LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const { user } = useAuth();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="flex items-center justify-between">
      <Link href="/" className="text-xl font-bold">
        Spnd
      </Link>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">{user?.email}</span>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage
                      src={user.user_metadata["avatar_url"]}
                      alt="shadcn"
                    />
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              }
            />
            <DropdownMenuContent className="w-40" align="start">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  nativeButton={false}
                  render={
                    <Link href="/settings">
                      <Cog />
                      Settings
                    </Link>
                  }
                ></DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={signOut} variant="destructive">
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant={"outline"}
            size={"default"}
            nativeButton={false}
            render={
              <Link href={"/sign-in"}>
                <LogIn />
                Log in
              </Link>
            }
          />
        )}
      </div>
    </header>
  );
}
