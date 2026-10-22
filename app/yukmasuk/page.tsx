import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { auth } from "@/auth";
import { getKuaSettings, setting } from "@/lib/kua";
import { uploadUrl } from "@/lib/uploads";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Masuk — Surat Digital KUA",
};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.isActive) {
    redirect("/dashboard");
  }

  const settings = await getKuaSettings();
  const instansi = setting(settings, "instansi", "Kantor Urusan Agama");
  const logoUrl = uploadUrl(settings.logo_path);

  return (
    <div className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-teal-50 via-emerald-50 to-white px-4 py-10 dark:from-gray-950 dark:via-gray-900 dark:to-teal-950">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-24 size-96 rounded-full bg-teal-200/40 blur-3xl dark:bg-teal-800/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-24 size-96 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-900/20"
      />

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={`Logo ${instansi}`}
              className="size-16 rounded-xl bg-white object-contain p-1 shadow-sm ring-1 ring-black/5"
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-xl bg-teal-700 text-2xl font-bold text-white shadow-sm">
              K
            </div>
          )}
          <h1 className="mt-4 text-xl font-semibold tracking-tight">
            Surat Digital KUA
          </h1>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">{instansi}</p>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-lg ring-1 ring-foreground/10 sm:p-8">
          <div className="mb-6 space-y-1">
            <h2 className="text-lg font-semibold">Masuk ke panel admin</h2>
            <p className="text-sm text-muted-foreground">
              Gunakan email dan password akun Anda.
            </p>
          </div>

          <LoginForm />

          <div className="mt-6 flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0 text-teal-600 dark:text-teal-400" />
            Akses dibatasi sesuai peran masing-masing pengguna.
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Kembali ke beranda
          </Link>
          <span className="text-xs text-muted-foreground">© KUA</span>
        </div>
      </div>
    </div>
  );
}
