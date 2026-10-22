"use client";

import Link from "next/link";
import { ChevronsUpDown, LogOut, UserCircle } from "lucide-react";

import { logout } from "@/app/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_LABELS, type Role } from "@/lib/roles";

type UserMenuProps = {
  name: string;
  email: string;
  role: Role;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}

export function UserMenu({ name, email, role }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex items-center gap-2 rounded-full p-1 pr-2 text-left transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          />
        }
      >
        <Avatar className="size-7">
          <AvatarFallback className="bg-teal-700 text-xs text-white">
            {initials(name)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-40 truncate text-sm leading-tight font-medium">
            {name}
          </span>
          <span className="block max-w-40 truncate text-xs leading-tight text-muted-foreground">
            {ROLE_LABELS[role]}
          </span>
        </span>
        <ChevronsUpDown className="hidden size-4 text-muted-foreground sm:block" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="truncate text-sm font-medium">{name}</div>
            <div className="truncate text-xs font-normal text-muted-foreground">
              {email}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/profile" />}>
            <UserCircle />
            Profil Saya
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <form action={logout}>
          <DropdownMenuItem
            nativeButton
            render={<button type="submit" className="w-full" />}
            className="text-destructive data-highlighted:text-destructive"
          >
            <LogOut />
            Keluar
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
