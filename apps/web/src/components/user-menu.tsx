"use client";

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
import { Cog, LogIn, LogOut } from "lucide-react";
import Link from "next/link";

export default function UserMenu({ user }: { user: User | null }) {
  return (
    <>
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
              <DropdownMenuItem
                onClick={() => console.log("sign out")}
                variant="destructive"
              >
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
    </>
  );
}
