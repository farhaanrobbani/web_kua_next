import { AppSidebar } from "@/components/admin/app-sidebar";
import { UserMenu } from "@/components/admin/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { requireUser } from "@/lib/authz";
import { getKuaSettings, setting } from "@/lib/kua";
import { uploadUrl } from "@/lib/uploads";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const settings = await getKuaSettings();
  const instansi = setting(settings, "instansi", "Kantor Urusan Agama");
  const logoUrl = uploadUrl(settings.logo_path);

  return (
    <SidebarProvider>
      <AppSidebar
        role={user.role}
        instansi={instansi}
        logoUrl={logoUrl}
        version="0.1"
      />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="truncate text-sm font-medium">Panel Admin</span>
            <span className="hidden truncate text-xs text-muted-foreground sm:inline">
              {instansi}
            </span>
          </div>
          <ThemeToggle />
          <UserMenu name={user.name} email={user.email} role={user.role} />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
