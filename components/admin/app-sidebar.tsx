"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { menuForRole } from "@/components/admin/nav-config";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { ROLE_LABELS, type Role } from "@/lib/roles";

type AppSidebarProps = {
  role: Role;
  instansi: string;
  logoUrl: string | null;
  version: string;
};

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar({
  role,
  instansi,
  logoUrl,
  version,
}: AppSidebarProps) {
  const pathname = usePathname();
  const groups = menuForRole(role);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip={instansi}
              render={<Link href="/dashboard" />}
            >
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={`Logo ${instansi}`}
                  className="size-8 shrink-0 rounded-md bg-white object-contain p-0.5 ring-1 ring-black/5"
                />
              ) : (
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                  K
                </div>
              )}
              <div className="grid min-w-0 flex-1 leading-tight">
                <span className="truncate text-sm font-semibold">{instansi}</span>
                <span className="truncate text-xs text-muted-foreground">
                  Panel Admin
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={active}
                        tooltip={item.label}
                        render={<Link href={item.href} />}
                        className="data-active:bg-teal-50 data-active:text-teal-800 dark:data-active:bg-teal-900/50 dark:data-active:text-teal-100"
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Lihat situs publik"
              render={<Link href="/" target="_blank" />}
            >
              <ExternalLink />
              <span>Lihat situs publik</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={`${ROLE_LABELS[role]} • v${version}`}
              className="text-muted-foreground hover:text-foreground"
            >
              <span className="truncate text-xs">
                {ROLE_LABELS[role]} · v{version}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
