import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/prisma";

export type KuaSettings = Record<string, string>;

export const getKuaSettings = cache(async (): Promise<KuaSettings> => {
  try {
    const rows = await prisma.kua_settings.findMany({
      select: { key: true, value: true },
    });
    return Object.fromEntries(rows.map((row) => [row.key, row.value ?? ""]));
  } catch {
    return {};
  }
});

export function setting(
  settings: KuaSettings,
  key: string,
  fallback = "",
): string {
  const value = settings[key];
  return value && value.length > 0 ? value : fallback;
}

export type NavItem = {
  key: string | null;
  label: string;
  url: string | null;
  icon: string | null;
  hasSubmenu: boolean;
  children: NavItem[];
};

const DEFAULT_NAV: NavItem[] = [
  {
    key: "beranda",
    label: "Beranda",
    url: "/",
    icon: null,
    hasSubmenu: false,
    children: [],
  },
  {
    key: "layanan",
    label: "Layanan",
    url: null,
    icon: null,
    hasSubmenu: true,
    children: [
      {
        key: null,
        label: "Pengajuan Surat Online",
        url: "/permohonan",
        icon: null,
        hasSubmenu: false,
        children: [],
      },
    ],
  },
  {
    key: "pengumuman",
    label: "Pengumuman",
    url: "/pengumuman",
    icon: null,
    hasSubmenu: false,
    children: [],
  },
  {
    key: "tentang",
    label: "Tentang Kami",
    url: null,
    icon: null,
    hasSubmenu: true,
    children: [
      {
        key: null,
        label: "Daftar Pegawai",
        url: "/daftar-pegawai",
        icon: null,
        hasSubmenu: false,
        children: [],
      },
      {
        key: null,
        label: "Download Center",
        url: "/unduhan",
        icon: null,
        hasSubmenu: false,
        children: [],
      },
      {
        key: null,
        label: "Kritik & Saran",
        url: "/kritik-saran",
        icon: null,
        hasSubmenu: false,
        children: [],
      },
    ],
  },
];

export const getNavbar = cache(async (): Promise<NavItem[]> => {
  try {
    const rows = await prisma.navbar_items.findMany({
      where: { active: true, parent_id: null },
      orderBy: [{ sort_order: "asc" }, { id: "asc" }],
      include: {
        other_navbar_items: {
          where: { active: true },
          orderBy: [{ sort_order: "asc" }, { id: "asc" }],
        },
      },
    });

    if (rows.length === 0) return DEFAULT_NAV;

    return rows.map((row) => ({
      key: row.key,
      label: row.label,
      url: row.url,
      icon: row.icon,
      hasSubmenu: row.has_submenu,
      children: row.other_navbar_items.map((child) => ({
        key: child.key,
        label: child.label,
        url: child.url,
        icon: child.icon,
        hasSubmenu: child.has_submenu,
        children: [],
      })),
    }));
  } catch {
    return DEFAULT_NAV;
  }
});

export const getHomeServices = cache(async (): Promise<NavItem[]> => {
  const items = await getNavbar();
  const layanan = items.find((item) => item.key === "layanan");
  return layanan ? layanan.children : [];
});

function todayInJakarta(): Date {
  const formatted = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return new Date(`${formatted}T00:00:00Z`);
}

export const getLatestAnnouncements = cache(async (limit = 3) => {
  try {
    return await prisma.announcements.findMany({
      where: {
        active: true,
        OR: [
          { published_at: null },
          { published_at: { lte: new Date() } },
        ],
      },
      orderBy: [
        { published_at: { sort: "desc", nulls: "last" } },
        { id: "desc" },
      ],
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        category: true,
        published_at: true,
        created_at: true,
        image: true,
      },
    });
  } catch {
    return [];
  }
});

export const getUpcomingMarriages = cache(async () => {
  try {
    return await prisma.marriage_announcements.findMany({
      where: {
        active: true,
        tanggal_akad: { gte: todayInJakarta() },
      },
      orderBy: [{ tanggal_akad: "asc" }, { id: "asc" }],
      select: {
        id: true,
        nama_pria: true,
        bin_pria: true,
        nama_wanita: true,
        binti_wanita: true,
        tanggal_akad: true,
        tempat_nikah: true,
      },
    });
  } catch {
    return [];
  }
});

export const ANNOUNCEMENT_CATEGORY: Record<
  string,
  { label: string; color: string }
> = {
  news: { label: "Berita", color: "bg-teal-100 text-teal-800" },
  article: { label: "Artikel", color: "bg-emerald-100 text-emerald-800" },
  announcement: {
    label: "Pengumuman",
    color: "bg-amber-100 text-amber-800",
  },
};
