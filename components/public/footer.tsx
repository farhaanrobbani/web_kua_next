import { SosmedIcon } from "@/components/public/sosmed-icon";
import { setting, type KuaSettings } from "@/lib/kua";

type FooterProps = {
  settings: KuaSettings;
};

type TerkaitLink = { label?: string; url?: string };

function parseLinks(raw: string): { label: string; url: string }[] {
  try {
    const parsed: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is TerkaitLink =>
          typeof item === "object" && item !== null,
      )
      .filter((item) => Boolean(item.label) && Boolean(item.url))
      .map((item) => ({ label: item.label as string, url: item.url as string }));
  } catch {
    return [];
  }
}

export function PublicFooter({ settings }: FooterProps) {
  const instansi = setting(settings, "instansi", "Kantor Urusan Agama");
  const kecamatan = setting(settings, "kecamatan");
  const kabupaten = setting(settings, "kabupaten");
  const kodePos = setting(settings, "kode_pos");

  const sosmeds = [
    {
      label: "Instagram",
      url: setting(settings, "sosmed_instagram"),
      platform: "instagram",
    },
    {
      label: "TikTok",
      url: setting(settings, "sosmed_tiktok"),
      platform: "tiktok",
    },
    {
      label: "WhatsApp",
      url: setting(settings, "sosmed_whatsapp"),
      platform: "whatsapp",
    },
  ].filter((item) => item.url);

  const links = parseLinks(settings.link_terkait ?? "[]");

  return (
    <footer className="bg-teal-900 text-teal-50">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-x-6 gap-y-8 px-6 py-10 text-sm sm:grid-cols-2 lg:flex lg:flex-wrap lg:justify-between lg:gap-x-8">
        <div className="lg:max-w-[16rem]">
          <p className="font-semibold">{instansi}</p>
          <p className="mt-2 leading-relaxed text-teal-100/70">
            {kecamatan
              ? `Kecamatan ${kecamatan}${kabupaten ? `, ${kabupaten}` : ""}`
              : ""}{" "}
            {kodePos ? `(${kodePos})` : ""}
          </p>
        </div>
        <div className="lg:max-w-[17rem]">
          <p className="font-semibold">Kontak</p>
          <p className="mt-2 break-words leading-relaxed text-teal-100/70">
            {setting(settings, "alamat") ? (
              <>
                {setting(settings, "alamat")}
                <br />
              </>
            ) : null}
            {setting(settings, "telepon") ? (
              <>
                Telepon: {setting(settings, "telepon")}
                <br />
              </>
            ) : null}
            {setting(settings, "email") ? `Email: ${setting(settings, "email")}` : null}
          </p>
        </div>
        <div>
          <p className="font-semibold">Jam Layanan</p>
          <p className="mt-2 whitespace-pre-line leading-relaxed text-teal-100/70">
            {setting(settings, "jam_layanan") || "Senin – Jumat\n08.00 – 15.00 WIB"}
          </p>
        </div>
        {sosmeds.length > 0 ? (
          <div>
            <p className="font-semibold">Media Sosial</p>
            <ul className="mt-2 space-y-2 text-teal-100/70">
              {sosmeds.map((sosmed) => (
                <li key={sosmed.platform}>
                  <a
                    href={sosmed.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 transition hover:text-white"
                  >
                    <SosmedIcon
                      platform={sosmed.platform}
                      className="h-4 w-4 shrink-0"
                    />
                    {sosmed.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {links.length > 0 ? (
          <div>
            <p className="font-semibold">Link Terkait</p>
            <ul className="mt-2 space-y-2 text-teal-100/70">
              {links.map((link) => (
                <li key={`${link.label}-${link.url}`}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 transition hover:text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                      />
                    </svg>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      <div className="border-t border-teal-800/60 py-4 text-center text-xs text-teal-200/60">
        &copy; {new Date().getFullYear()} {instansi}. Seluruh hak cipta dilindungi.
      </div>
    </footer>
  );
}
