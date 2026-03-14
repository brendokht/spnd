"use client";

import { createClient } from "@/lib/supabase/client";
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
import { User } from "@supabase/supabase-js";
import { Cog, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserMenu({ user }: { user: User }) {
  const supabase = createClient();
  const router = useRouter();
  return (
    <>
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
            <DropdownMenuItem
              onClick={() => {
                supabase.auth.signOut();
                router.push("/login");
              }}
              variant="destructive"
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
