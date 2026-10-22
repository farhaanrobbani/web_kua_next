import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpenCheck,
  ClipboardList,
  Database,
  Download,
  FileStack,
  FileText,
  FileType2,
  FolderDown,
  HeartHandshake,
  Inbox,
  LayoutDashboard,
  Mail,
  Megaphone,
  MessageSquare,
  Settings,
  UserCog,
  Users,
} from "lucide-react";

import type { Role } from "@/lib/roles";

export type AdminMenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: readonly Role[];
};

export type AdminMenuGroup = {
  label: string;
  items: readonly AdminMenuItem[];
};

export const ADMIN_MENU: readonly AdminMenuGroup[] = [
  {
    label: "Utama",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Persuratan",
    items: [
      { label: "Surat", href: "/letters", icon: Mail },
      { label: "Permohonan", href: "/submissions", icon: Inbox },
      {
        label: "Jenis Surat",
        href: "/letter-types",
        icon: FileType2,
        roles: ["operator", "superadmin"],
      },
      {
        label: "Template",
        href: "/letter-templates",
        icon: FileText,
        roles: ["operator", "superadmin"],
      },
    ],
  },
  {
    label: "Laporan Kinerja",
    items: [
      { label: "Kegiatan Harian", href: "/lapkin/kegiatan", icon: ClipboardList },
      { label: "Export", href: "/lapkin/export", icon: Download },
      {
        label: "Master Data Harian",
        href: "/lapkin/master",
        icon: Database,
        roles: ["operator", "superadmin"],
      },
      {
        label: "SKP",
        href: "/lapkin/skp",
        icon: BarChart3,
        roles: ["operator", "superadmin"],
      },
    ],
  },
  {
    label: "Konten",
    items: [
      {
        label: "Posts",
        href: "/announcements",
        icon: Megaphone,
        roles: ["operator", "superadmin"],
      },
      {
        label: "Download Center",
        href: "/download-items",
        icon: FolderDown,
        roles: ["operator", "superadmin"],
      },
      {
        label: "Pengumuman Nikah",
        href: "/marriage-announcements",
        icon: HeartHandshake,
        roles: ["operator", "superadmin"],
      },
      {
        label: "Page",
        href: "/pages",
        icon: FileStack,
        roles: ["superadmin"],
      },
      {
        label: "Daftar Staf",
        href: "/staff",
        icon: Users,
        roles: ["operator", "superadmin"],
      },
      {
        label: "Navbar",
        href: "/navbar",
        icon: BookOpenCheck,
        roles: ["superadmin"],
      },
    ],
  },
  {
    label: "Lainnya",
    items: [
      {
        label: "Kritik & Saran",
        href: "/kelola-kritik-saran",
        icon: MessageSquare,
      },
    ],
  },
  {
    label: "Administrasi",
    items: [
      {
        label: "Akun",
        href: "/users",
        icon: UserCog,
        roles: ["superadmin"],
      },
      {
        label: "Pengaturan Web",
        href: "/kua-settings",
        icon: Settings,
        roles: ["superadmin"],
      },
    ],
  },
];

export function menuForRole(role: Role): AdminMenuGroup[] {
  return ADMIN_MENU.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => !item.roles || item.roles.includes(role),
    ),
  })).filter((group) => group.items.length > 0);
}
