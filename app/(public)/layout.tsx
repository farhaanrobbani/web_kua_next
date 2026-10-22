import type { Metadata } from "next";

import { PublicFooter } from "@/components/public/footer";
import { PublicHeader } from "@/components/public/header";
import { getKuaSettings, getNavbar, setting } from "@/lib/kua";
import { uploadUrl } from "@/lib/uploads";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getKuaSettings();
  const instansi = setting(settings, "instansi", "Surat Digital KUA");
  const kecamatan = setting(settings, "kecamatan");
  const logo = uploadUrl(settings.logo_path);

  return {
    title: `${instansi} — ${
      kecamatan ? `Kecamatan ${kecamatan}` : "Layanan Surat Online"
    }`,
    description:
      setting(settings, "hero_subjudul") ||
      "Layanan surat digital Kantor Urusan Agama: ajukan permohonan surat keterangan dan surat pengantar secara online.",
    icons: {
      icon: logo ?? "/favicon.ico",
    },
  };
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, navbar] = await Promise.all([getKuaSettings(), getNavbar()]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-teal-50 via-emerald-50 to-white font-sans text-[#1b1b18] antialiased">
      <PublicHeader
        items={navbar}
        instansi={setting(settings, "instansi", "Surat Digital KUA")}
        logoUrl={uploadUrl(settings.logo_path)}
      />
      <main className="flex-1 animate-fade-up">{children}</main>
      <PublicFooter settings={settings} />
    </div>
  );
}
