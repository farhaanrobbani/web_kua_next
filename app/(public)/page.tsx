/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import { MarriageSchedule } from "@/components/public/marriage-schedule";
import { PrayerSchedule } from "@/components/public/prayer-schedule";
import { ServiceIcon } from "@/components/public/service-icon";
import { excerpt, tanggalId } from "@/lib/format";
import {
  ANNOUNCEMENT_CATEGORY,
  getHomeServices,
  getKuaSettings,
  getLatestAnnouncements,
  getNavbar,
  getUpcomingMarriages,
  setting,
} from "@/lib/kua";
import { uploadUrl } from "@/lib/uploads";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, services, announcements, marriages, navbar] =
    await Promise.all([
      getKuaSettings(),
      getHomeServices(),
      getLatestAnnouncements(3),
      getUpcomingMarriages(),
      getNavbar(),
    ]);

  const instansi = setting(settings, "instansi", "Surat Digital KUA");
  const kecamatan = setting(settings, "kecamatan");
  const heroJudul = setting(settings, "hero_judul");
  const heroSubjudul = setting(settings, "hero_subjudul");
  const bgUrl = uploadUrl(settings.bg_path);
  const heroUrl = uploadUrl(settings.hero_path);

  const pengumumanItem = navbar.find((item) => item.key === "pengumuman");
  const pengumumanLabel = pengumumanItem?.label || "Berita";
  const pengumumanBase = pengumumanItem?.url || "/pengumuman";
  const nikahItem = navbar.find((item) => item.key === "pengumuman-nikah");
  const nikahBase = nikahItem?.url || "/pengumuman-nikah";

  return (
    <>
      <section
        style={
          bgUrl ? { backgroundImage: `url('${bgUrl}')` } : undefined
        }
        className={`relative ${
          bgUrl
            ? "bg-cover bg-center"
            : "bg-gradient-to-br from-teal-50 via-emerald-50 to-white"
        }`}
      >
        {bgUrl ? (
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        ) : null}
        <div className="relative mx-auto max-w-5xl px-6 pb-16 pt-16 text-center sm:pt-20">
          <p
            className={`text-sm font-medium uppercase tracking-widest ${
              bgUrl ? "text-teal-100" : "text-teal-700"
            }`}
          >
            {kecamatan
              ? `Kantor Urusan Agama ${kecamatan}`
              : "Kantor Urusan Agama"}
          </p>
          <h1
            className={`mx-auto mt-3 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl ${
              bgUrl ? "text-white" : ""
            }`}
          >
            {heroJudul ? (
              <span className="whitespace-pre-line">{heroJudul}</span>
            ) : (
              <>
                Layanan Surat Digital
                <br />
                Tanpa Antre, Kapan Saja
              </>
            )}
          </h1>
          <p
            className={`mx-auto mt-4 max-w-xl text-base leading-relaxed ${
              bgUrl ? "text-white/85" : "text-[#1b1b1870]"
            }`}
          >
            {heroSubjudul ||
              "Ajukan permohonan surat keterangan dan surat pengantar secara online. Pihak KUA akan memverifikasi, menerbitkan, dan menandatangani surat Anda secara digital."}
          </p>
        </div>
      </section>

      {heroUrl ? (
        <img
          src={heroUrl}
          alt={`Banner ${instansi}`}
          className="mx-auto mt-8 max-h-72 w-full max-w-4xl rounded-xl border border-teal-100 object-cover shadow-sm"
        />
      ) : null}

      {marriages.length > 0 ? (
        <section className="mx-auto max-w-5xl px-6 pb-10 pt-12">
          <MarriageSchedule
            announcements={marriages}
            title="Jadwal Pelaksanaan Nikah"
          />
          <div className="mt-6 text-center">
            <Link
              href={nikahBase}
              className="text-sm font-medium text-teal-700 hover:underline"
            >
              Lihat Daftar Lengkap Pengumuman Nikah →
            </Link>
          </div>
        </section>
      ) : null}

      {services.length > 0 ? (
        <section className="mx-auto max-w-5xl px-6 pb-8 pt-8">
          <h2 className="text-center text-xl font-bold">Layanan Kami</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.key ?? service.label}
                href={service.url || "#"}
                className="rounded-lg border border-teal-100 bg-white p-5 shadow-sm transition hover:border-teal-300"
              >
                <div className="flex items-center gap-3">
                  <span className="text-teal-700">
                    <ServiceIcon icon={service.icon} className="h-7 w-7" />
                  </span>
                  <h3 className="font-semibold text-teal-900">
                    {service.label}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {announcements.length > 0 ? (
        <section className="mx-auto max-w-5xl px-6 pb-16 pt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{pengumumanLabel} Terbaru</h2>
            <Link
              href={pengumumanBase}
              className="text-sm font-medium text-teal-700 hover:underline"
            >
              Lihat Semua {pengumumanLabel}
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {announcements.map((announcement) => {
              const image = uploadUrl(announcement.image);
              const category =
                ANNOUNCEMENT_CATEGORY[announcement.category] ??
                ANNOUNCEMENT_CATEGORY.announcement;
              const date =
                announcement.published_at ??
                announcement.created_at ??
                new Date();

              return (
                <Link
                  key={announcement.id}
                  href={`${pengumumanBase}/${announcement.slug}`}
                  className="group overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="relative flex h-40 items-center justify-center bg-teal-50 text-4xl">
                    {image ? (
                      <img
                        src={image}
                        alt={announcement.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <svg
                        className="h-10 w-10 text-teal-200"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.25 9l-3.75 3.75m0 0L11.25 16.5m-3.75-3.75h3m-6.75 2.25a3.75 3.75 0 013.75-3.75H5.25a3.75 3.75 0 013.75-3.75h4.5a3.75 3.75 0 013.75 3.75v2.25a3.75 3.75 0 01-3.75 3.75H9.75a3.75 3.75 0 01-3.75-3.75z"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${category.color}`}
                      >
                        {category.label}
                      </span>
                      <span className="shrink-0 text-xs text-slate-500">
                        {tanggalId(date)}
                      </span>
                    </div>
                    <h3 className="mt-3 font-semibold leading-snug text-slate-900 group-hover:text-teal-700">
                      {announcement.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm text-slate-500">
                      {excerpt(announcement.excerpt, announcement.content)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <PrayerSchedule />
    </>
  );
}
